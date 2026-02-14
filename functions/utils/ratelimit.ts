/**
 * Simple IP-based rate limiter using KV.
 * Allows MAX_REQUESTS per RATE_LIMIT_WINDOW_MS per IP address.
 */

import { MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "./config";

/**
 * Peek at current usage without incrementing.
 */
export async function peekRateLimit(
  kv: KVNamespace,
  ip: string
): Promise<{ used: number; limit: number; remaining: number }> {
  const key = `rate:${ip}`;
  const now = Date.now();

  const raw = await kv.get(key);
  if (!raw) return { used: 0, limit: MAX_REQUESTS, remaining: MAX_REQUESTS };

  const entry: RateLimitEntry = JSON.parse(raw);
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    return { used: 0, limit: MAX_REQUESTS, remaining: MAX_REQUESTS };
  }

  const used = Math.min(entry.count, MAX_REQUESTS);
  return { used, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - used };
}

/**
 * Check and increment rate limit.
 */
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
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 0, windowStart: now };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment and save
  entry.count++;
  const ttlSeconds = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
  await kv.put(key, JSON.stringify(entry), { expirationTtl: ttlSeconds });

  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
