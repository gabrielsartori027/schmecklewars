import "server-only";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. Without a configured secret, deny. */
export function isAuthorizedCron(req: Request): boolean {
  const secret = env.CRON_SECRET;
  if (!secret) return env.NODE_ENV !== "production";
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}
