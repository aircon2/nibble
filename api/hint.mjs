import { handleRequest } from '../backend/index.mjs';

export default function handler(request, response) {
  return handleRequest(request, response, '/hint');
}
