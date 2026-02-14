import { verifyTurnstile } from "../utils/turnstile";
import { checkRateLimit } from "../utils/ratelimit";
import { MAX_LINKS, MAX_REQUESTS } from "../utils/config";
import {
  generateLinkId,
  jsonResponse,
  errorResponse,
} from "../utils/helpers";

/**
 * POST /api/create
 * Body: { senderName, recipientName, turnstileToken }
 * Creates a new valentine link and stores it in KV.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  let body: {
    senderName?: string;
    recipientName?: string;
    turnstileToken?: string;
    youtubeUrl?: string;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const { senderName, recipientName, turnstileToken, youtubeUrl } = body;

  if (!senderName || !recipientName) {
    return errorResponse("Both senderName and recipientName are required");
  }

  const trimmedSender = senderName.trim();
  const trimmedRecipient = recipientName.trim();

  if (trimmedSender.length < 2 || trimmedRecipient.length < 2) {
    return errorResponse("Names must be at least 2 characters");
  }

  if (trimmedSender.length > 50 || trimmedRecipient.length > 50) {
    return errorResponse("Names must be 50 characters or fewer");
  }

  // Only allow letters (any script), spaces, hyphens, apostrophes, periods
  const namePattern = /^[\p{L}\p{M}' .\-]+$/u;
  if (!namePattern.test(trimmedSender) || !namePattern.test(trimmedRecipient)) {
    return errorResponse("Names can only contain letters, spaces, hyphens and apostrophes");
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

  const { allowed, remaining } = await checkRateLimit(env.ACHALUGO_KV, ip);
  if (!allowed) {
    return errorResponse(
      `Too many requests. You can create up to ${MAX_REQUESTS} links per day.`,
      429
    );
  }

  const counterRaw = await env.ACHALUGO_KV.get("meta:counter");
  const counter = counterRaw ? parseInt(counterRaw, 10) : 0;

  if (counter >= MAX_LINKS) {
    return jsonResponse({ closed: true, message: "Submissions are closed!" });
  }

  // Validate YouTube URL if provided
  let sanitizedYoutubeUrl: string | undefined;
  if (youtubeUrl) {
    const yt = youtubeUrl.trim();
    if (yt.length > 200) {
      return errorResponse("YouTube URL is too long");
    }
    const ytPattern = /^https?:\/\/([a-z]+\.)?(youtube\.com|youtu\.be)\//;;
    if (!ytPattern.test(yt)) {
      return errorResponse("Please enter a valid YouTube URL");
    }
    sanitizedYoutubeUrl = yt;
  }

  const id = generateLinkId();
  const record: LinkRecord = {
    id,
    senderName: trimmedSender,
    recipientName: trimmedRecipient,
    accepted: false,
    createdAt: new Date().toISOString(),
    ...(sanitizedYoutubeUrl ? { youtubeUrl: sanitizedYoutubeUrl } : {}),
  };

  await env.ACHALUGO_KV.put(`link:${id}`, JSON.stringify(record));
  await env.ACHALUGO_KV.put("meta:counter", String(counter + 1));

  return jsonResponse({
    success: true,
    linkId: id,
    url: `/l/${id}`,
  });
};
