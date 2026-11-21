import { createServer } from 'node:http';
import { GoogleGenAI } from '@google/genai';

const port = Number(process.env.HINT_PORT ?? 8787);
const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const key = process.env.GEMINI_API_KEY;
const ai = key ? new GoogleGenAI({ apiKey: key }) : null;

const questions = {
  'two-sum-indices': { context: 'Two Sum: nums=[3,2,4], target=6. Return two distinct zero-based indices.', options: { a: '[0,0]', b: '[1,2]', c: '[0,2]' } },
  'two-sum-duplicate': { context: 'Two Sum: nums=[3,3], target=6. Equal values at different positions are allowed.', options: { a: '[0,0]', b: '[0,1]', c: 'No solution' } },
  'two-sum-hash': { context: 'Two Sum: identify the one-pass hash map step after computing target minus current number.', options: { a: 'Lookup complement', b: 'Sort and use new indices', c: 'Try all pairs' } },
  'two-sum-code': { context: 'Two Sum Python code assembly: compute need=target-number, return indices if need is in seen, then store seen[number]=i.', options: {} },
  'brackets-order': { context: 'Valid Parentheses: s="([)]". Decide if closing order matches a stack.', options: { a: 'Valid by counts', b: 'Invalid: mismatch', c: 'Valid eventually' } },
  'brackets-finish': { context: 'Valid Parentheses: s="(()". One opening bracket remains on the stack.', options: { a: 'True', b: 'False', c: 'True by counts' } },
  'brackets-code': { context: 'Valid Parentheses Python code assembly: push an opening bracket; reject a mismatched closing bracket; after scanning, return whether the stack is empty.', options: {} },
  'substring-length': { context: 'Longest Substring Without Repeating Characters: s="pwwkew". Find the longest contiguous unique-character length.', options: { a: '2', b: '3', c: '4' } },
  'substring-repeat': { context: 'Longest Substring: s="abba". At the second b at index 2, where should the window left edge move?', options: { a: '1', b: '2', c: '3' } },
  'substring-left': { context: 'Longest Substring: s="abba". After index 2 left is 2; at index 3 the old a was at 0 outside the window.', options: { a: 'left=0', b: 'left=1', c: 'left=2' } },
  'substring-code': { context: 'Longest Substring Python code assembly: move left past a repeated character using max; update last_seen; update best window length.', options: {} },
};

function respond(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(data));
}

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return respond(response, 204, {});
  if (request.method !== 'POST' || request.url !== '/hint') return respond(response, 404, { error: 'Not found' });
  if (!ai) return respond(response, 503, { error: 'Gemini key not configured' });

  try {
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 4096) return respond(response, 413, { error: 'Request too large' });
    }
    const input = JSON.parse(body);
    const question = questions[input.questionId];
    if (!question) return respond(response, 400, { error: 'Unknown question' });
    const selected = Object.hasOwn(question.options, input.selectedId) ? question.options[input.selectedId] : 'nothing yet';
    const answer = await ai.models.generateContent({
      model,
      contents: `You are Nibble, a kind beginner coding tutor. Give exactly one short hint (at most 25 words) for a mobile lesson. Do not reveal the answer, the correct option, or a complete solution. Focus on the next reasoning step. Problem: ${question.context} The learner selected ${selected}. Reply with only the hint.`,
      config: { maxOutputTokens: 90, temperature: 0.4 },
    });
    const hint = answer.text?.trim().slice(0, 220);
    if (!hint) throw new Error('Empty response');
    return respond(response, 200, { hint });
  } catch (error) {
    console.error('Hint request failed:', error instanceof Error ? error.message : error);
    return respond(response, 502, { error: 'Gemini unavailable' });
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Nibble hint server listening at http://127.0.0.1:${port}/hint${ai ? '' : ' (no API key yet)'}`);
});
