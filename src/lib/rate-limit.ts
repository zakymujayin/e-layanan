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
