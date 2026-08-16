/**
 * Parse a JSON request body. GET/HEAD and non-JSON content types yield {}.
 */
export async function readJsonBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return {};
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('json')) return {};
  try {
    return await request.json();
  } catch {
    return {};
  }
}
