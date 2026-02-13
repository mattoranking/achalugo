/**
 * Server-side Cloudflare Turnstile verification.
 * Calls Cloudflare's siteverify endpoint to validate a client token.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | null
): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
    ...(ip ? { remoteip: ip } : {}),
  });

  const result = await fetch(VERIFY_URL, {
    method: "POST",
    body,
  });

  const outcome = (await result.json()) as { success: boolean };
  return outcome.success;
}
