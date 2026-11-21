import pg from 'pg';
import { readFileSync } from 'node:fs';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const databaseUrl = process.env.DATABASE_URL;
const issuer = process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/+$/, '') + '/';
const audience = process.env.AUTH0_AUDIENCE;
const configured = Boolean(databaseUrl && audience && process.env.AUTH0_ISSUER_BASE_URL);
const connection = databaseUrl ? new URL(databaseUrl) : null;
const isTigerCloud = connection?.hostname.endsWith('.tsdb.cloud.timescale.com');
// Node does not bundle Tiger Cloud's CA. Pin it instead of skipping TLS verification.
const tigerCa = isTigerCloud ? readFileSync(new URL('./tiger-ca.crt', import.meta.url), 'utf8') : undefined;
connection?.searchParams.delete('sslmode'); // pg otherwise replaces the explicit CA settings below.
const pool = connection ? new pg.Pool({
  connectionString: connection.toString(),
  ssl: isTigerCloud ? { ca: tigerCa, rejectUnauthorized: true } : undefined,
  max: 3,
  connectionTimeoutMillis: 5000,
}) : null;
const jwks = configured ? createRemoteJWKSet(new URL('.well-known/jwks.json', issuer)) : null;
const lessonIds = new Set(['two-sum', 'valid-parentheses', 'longest-substring']);
let schemaPromise;

function send(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://localhost:8081',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(data));
}

async function ensureSchema() {
  if (!schemaPromise) schemaPromise = pool.query(`
    CREATE TABLE IF NOT EXISTS nibble_lesson_completions (
      user_sub TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      first_completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_sub, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS nibble_practice_days (
      user_sub TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      practice_date DATE NOT NULL,
      practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_sub, lesson_id, practice_date)
    );
    CREATE INDEX IF NOT EXISTS nibble_practice_user_date_idx
      ON nibble_practice_days (user_sub, practice_date DESC);
  `).catch((error) => { schemaPromise = undefined; throw error; });
  await schemaPromise;
}

export async function initializeProgressStore() {
  if (!configured) return false;
  await ensureSchema();
  return true;
}

async function readProgress(userSub) {
  const [days, completions] = await Promise.all([
    pool.query('SELECT DISTINCT practice_date::text AS day FROM nibble_practice_days WHERE user_sub = $1 ORDER BY day', [userSub]),
    pool.query('SELECT lesson_id FROM nibble_lesson_completions WHERE user_sub = $1 ORDER BY first_completed_at', [userSub]),
  ]);
  const completedLessons = completions.rows.map((row) => row.lesson_id);
  return { completedDates: days.rows.map((row) => row.day), completedLessons, xp: completedLessons.length * 20 };
}

async function bodyJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 2048) throw Object.assign(new Error('Request too large'), { status: 413 });
  }
  try { return JSON.parse(body); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

async function authenticate(request) {
  const match = /^Bearer (\S+)$/.exec(request.headers.authorization || '');
  if (!match) throw Object.assign(new Error('Sign in required'), { status: 401 });
  try {
    const { payload } = await jwtVerify(match[1], jwks, { issuer, audience });
    if (typeof payload.sub !== 'string') throw new Error('Missing subject');
    return payload.sub;
  } catch { throw Object.assign(new Error('Invalid sign-in token'), { status: 401 }); }
}

export async function handleProgress(request, response) {
  if (request.url !== '/progress' && request.url !== '/practice') return false;
  if (request.method === 'OPTIONS') { send(response, 204, {}); return true; }
  if (!configured) { send(response, 503, { error: 'Progress sync is not configured' }); return true; }
  if ((request.url === '/progress' && !['GET', 'DELETE'].includes(request.method)) ||
      (request.url === '/practice' && request.method !== 'POST')) {
    send(response, 405, { error: 'Method not allowed' }); return true;
  }

  try {
    const userSub = await authenticate(request);
    await ensureSchema();
    if (request.url === '/progress' && request.method === 'GET') {
      send(response, 200, await readProgress(userSub));
      return true;
    }
    if (request.url === '/progress' && request.method === 'DELETE') {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM nibble_practice_days WHERE user_sub = $1', [userSub]);
        await client.query('DELETE FROM nibble_lesson_completions WHERE user_sub = $1', [userSub]);
        await client.query('COMMIT');
      } catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
      send(response, 200, { completedDates: [], completedLessons: [], xp: 0 });
      return true;
    }

    const input = await bodyJson(request);
    if (!input || typeof input !== 'object') {
      send(response, 400, { error: 'Invalid practice event' });
      return true;
    }
    const lessonId = typeof input.lessonId === 'string' ? input.lessonId : '';
    const practiceDate = typeof input.practiceDate === 'string' ? input.practiceDate : '';
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(practiceDate) ? new Date(`${practiceDate}T00:00:00Z`) : null;
    if (!lessonIds.has(lessonId) || !parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== practiceDate ||
        Math.abs(Date.now() - parsed.getTime()) > 3 * 86400000) {
      send(response, 400, { error: 'Invalid practice event' });
      return true;
    }

    const client = await pool.connect();
    let earned = 0;
    try {
      await client.query('BEGIN');
      const first = await client.query(
        'INSERT INTO nibble_lesson_completions (user_sub, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING lesson_id',
        [userSub, lessonId],
      );
      earned = first.rowCount ? 20 : 0;
      await client.query(
        'INSERT INTO nibble_practice_days (user_sub, lesson_id, practice_date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [userSub, lessonId, practiceDate],
      );
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
    send(response, 200, { ...await readProgress(userSub), earned });
  } catch (error) {
    const status = error.status || 502;
    if (status >= 500) console.error('Progress request failed:', error instanceof Error ? error.message : error);
    send(response, status, { error: status >= 500 ? 'Progress sync unavailable' : error.message });
  }
  return true;
}
