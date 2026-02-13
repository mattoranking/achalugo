import { verifyTurnstile } from "../utils/turnstile";
import { jsonResponse, errorResponse } from "../utils/helpers";

/**
 * POST /api/waitlist
 * Body: { email, turnstileToken }
 * Stores an email on the waitlist when submissions are closed.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  let body: { email?: string; turnstileToken?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const { email, turnstileToken } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse("A valid email is required");
  }

  if (!turnstileToken) {
    return errorResponse("Turnstile verification required", 403);
  }

  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET,
    ip
  );
  if (!turnstileOk) {
    return errorResponse("Turnstile verification failed", 403);
  }

  // Use a simple hash of the email as the key to prevent duplicates
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const entry: WaitlistEntry = {
    email: email.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
  };

  await env.ACHALUGO_KV.put(`waitlist:${hash}`, JSON.stringify(entry));

  return jsonResponse({ success: true, message: "You're on the list! 💌" });
};
