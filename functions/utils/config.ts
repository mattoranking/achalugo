/**
 * Achalugo — Centralised configuration constants.
 * Change values here and they propagate everywhere.
 */

/** Maximum valentine links that can ever be created (global cap). */
export const MAX_LINKS = 500;

/** Maximum links a single IP can create per rate-limit window. */
export const MAX_REQUESTS = 2;

/** Rate-limit window duration in milliseconds (24 hours). */
export const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
