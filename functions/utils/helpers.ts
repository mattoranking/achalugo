/**
 * Shared helpers for API responses and ID generation.
 */

export function generateLinkId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    id += chars[byte % chars.length];
  }
  return id;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export const MAX_LINKS = 500;
