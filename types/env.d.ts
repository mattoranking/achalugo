/// Typed environment bindings for Cloudflare Pages Functions

interface Env {
  /** Single KV namespace for all data: links, meta counter, waitlist, rate limits */
  ACHALUGO_KV: KVNamespace;

  /** Turnstile secret key — set via `wrangler secret put TURNSTILE_SECRET` */
  TURNSTILE_SECRET: string;
}

/** A valentine link record stored in KV under key `link:<id>` */
interface LinkRecord {
  id: string;
  senderName: string;
  recipientName: string;
  accepted: boolean;
  createdAt: string; // ISO timestamp
}

/** Rate limit entry stored in KV under key `rate:<ip>` */
interface RateLimitEntry {
  count: number;
  windowStart: number; // epoch ms
}

/** Waitlist entry stored in KV under key `waitlist:<hash>` */
interface WaitlistEntry {
  email: string;
  createdAt: string;
}
