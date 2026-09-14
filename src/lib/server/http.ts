import "server-only";
import { NextResponse } from "next/server";

/** Read-only CORS for public audit routes (/api/state, /api/events). */
export const PUBLIC_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export function cacheHeaders(sMaxAge: number, swr: number) {
  return {
    "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
    "CDN-Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
  } as const;
}

export function json(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): NextResponse {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: { "X-Content-Type-Options": "nosniff", ...init.headers },
  });
}

export function options(headers: Record<string, string> = PUBLIC_CORS) {
  return new NextResponse(null, { status: 204, headers });
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
