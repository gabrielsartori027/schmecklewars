import "server-only";
import { KEYS, type KV } from "./kv";

export const READ_LIMIT_PER_MINUTE = 60;

/** Fixed-window counter per IP+route: 60 req/min on the read routes. */
export async function checkRateLimit(kv: KV | null, ip: string, route: string): Promise<boolean> {
  if (!kv) return true;
  const minute = Math.floor(Date.now() / 60_000);
  try {
    const n = await kv.incr(KEYS.rateLimit(`${route}:${ip}`, minute), { ex: 65 });
    return n <= READ_LIMIT_PER_MINUTE;
  } catch {
    return true; // never block reads because the limiter is down
  }
}
