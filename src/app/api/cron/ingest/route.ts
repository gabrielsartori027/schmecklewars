import { isAuthorizedCron } from "@/lib/server/cron-auth";
import { json } from "@/lib/server/http";
import { runIngest } from "@/lib/server/ingest";
import { getKV } from "@/lib/server/kv";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Vercel Cron (every 10 min by default, see vercel.json). Requires `Authorization: Bearer CRON_SECRET`. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return json({ ok: false, error: "unauthorized" }, { status: 401 });
  const outcome = await runIngest(getKV());
  const status = "ok" in outcome && outcome.ok === false ? 502 : 200;
  return json(outcome, { status, headers: { "Cache-Control": "no-store" } });
}
