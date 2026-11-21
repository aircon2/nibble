import { createServer } from 'node:http';
import { handleRequest } from './index.mjs';
import { initializeProgressStore } from './progress.mjs';

const port = Number(process.env.PORT ?? process.env.HINT_PORT ?? 8787);
const host = process.env.HOST || '127.0.0.1';

createServer(handleRequest).listen(port, host, () => {
  console.log(`Nibble hint server listening at http://${host}:${port}/hint${process.env.GEMINI_API_KEY ? '' : ' (no API key yet)'}`);
  initializeProgressStore()
    .then((ready) => console.log(ready ? 'Account progress database ready' : 'Account progress database not configured'))
    .catch((error) => console.error('Account progress database unavailable:', error instanceof Error ? error.message : error));
});
