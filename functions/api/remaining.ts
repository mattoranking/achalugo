import { jsonResponse, MAX_LINKS } from "../utils/helpers";
import { peekRateLimit } from "../utils/ratelimit";

/**
 * GET /api/remaining
 * Returns global closed status + personal rate-limit usage.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  const counterRaw = await env.ACHALUGO_KV.get("meta:counter");
  const globalUsed = counterRaw ? parseInt(counterRaw, 10) : 0;
  const closed = globalUsed >= MAX_LINKS;

  const personal = await peekRateLimit(env.ACHALUGO_KV, ip);

  return jsonResponse({
    closed,
    personalUsed: personal.used,
    personalLimit: personal.limit,
    personalRemaining: personal.remaining,
  });
};
