import { createServer } from 'node:http';
import { GoogleGenAI } from '@google/genai';

const port = Number(process.env.HINT_PORT ?? 8787);
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const key = process.env.GEMINI_API_KEY;
const ai = key ? new GoogleGenAI({ apiKey: key }) : null;

const lessons = {
  'find-pair': { list: [2, 7, 11, 15], target: 9, options: { a: '2 + 7', b: '7 + 11', c: '2 + 15' } },
  complement: { list: [2, 7, 11, 15], target: 9, options: { a: '5', b: '7', c: '11' } },
  transfer: { list: [3, 5, 6, 10], target: 11, options: { a: '3 + 6', b: '5 + 10', c: '5 + 6' } },
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
    const lesson = lessons[input.questionId];
    if (!lesson) return respond(response, 400, { error: 'Unknown question' });
    const selected = Object.hasOwn(lesson.options, input.selectedId) ? lesson.options[input.selectedId] : 'nothing yet';
    const interaction = await ai.interactions.create({
      model,
      input: `You are Nibble, a kind beginner coding tutor. Give exactly one short hint (at most 25 words) for a mobile lesson. Do not reveal the answer, the correct option, or a complete solution. Focus on the next reasoning step. The learner is finding a pair or complement in list [${lesson.list.join(', ')}] for target ${lesson.target}. They selected ${selected}. Reply with only the hint.`,
    });
    const hint = interaction.output_text?.trim().slice(0, 220);
    if (!hint) throw new Error('Empty response');
    return respond(response, 200, { hint });
  } catch (error) {
    console.error('Hint request failed:', error instanceof Error ? error.message : error);
    return respond(response, 502, { error: 'Gemini unavailable' });
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Nibble hint server listening at http://127.0.0.1:${port}/hint${ai ? '' : ' (no API key yet)'}`);
});
