/**
 * In-memory rate limiter — single-process only.
 *
 * Works correctly as long as the app runs as a single Node.js process.
 * For campus scale (~50 concurrent users) single-process is adequate.
 *
 * If horizontal scaling is needed, replace this Map with a Redis-backed
 * implementation or use DB-level upsert via Prisma.
 *
 * DO NOT run multiple workers (PM2 cluster mode) without replacing this.
 */

type RateRecord = { count: number; resetAt: number };
const store = new Map<string, RateRecord>();

/** Returns true if the key has exceeded the limit — caller should reject. */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= limit) return true;

  record.count++;
  return false;
}
