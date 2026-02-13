/**
 * Simple IP-based rate limiter using KV.
 * Allows MAX_REQUESTS per WINDOW_MS per IP address.
 */

const MAX_REQUESTS = 5;     // max link creations per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function checkRateLimit(
  kv: KVNamespace,
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:${ip}`;
  const now = Date.now();

  const raw = await kv.get(key);
  let entry: RateLimitEntry = raw
    ? JSON.parse(raw)
    : { count: 0, windowStart: now };

  // Reset window if expired
  if (now - entry.windowStart > WINDOW_MS) {
    entry = { count: 0, windowStart: now };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment and save
  entry.count++;
  const ttlSeconds = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
  await kv.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds });

  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
