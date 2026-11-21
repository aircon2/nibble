export async function readJsonBody(request, maxBytes) {
  let raw = '';
  let parsedBody;
  try { parsedBody = request.body; }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
  if (parsedBody !== undefined) {
    raw = typeof parsedBody === 'string' ? parsedBody :
      Buffer.isBuffer(parsedBody) ? parsedBody.toString('utf8') : JSON.stringify(parsedBody);
  } else {
    for await (const chunk of request) {
      raw += chunk;
      if (Buffer.byteLength(raw) > maxBytes) throw Object.assign(new Error('Request too large'), { status: 413 });
    }
  }
  if (Buffer.byteLength(raw) > maxBytes) throw Object.assign(new Error('Request too large'), { status: 413 });
  try { return JSON.parse(raw); }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}
