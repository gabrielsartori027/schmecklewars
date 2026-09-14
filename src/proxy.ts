import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request nonce CSP (prompt §11): `script-src 'self' 'nonce-…' 'strict-dynamic'`.
 * Next.js reads the nonce from the CSP request header and applies it to its own scripts.
 * connect-src lists the RPC / GeckoTerminal / Blockscout hosts although the browser only
 * talks to our own /api/* today (data is fetched server-side).
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://rpc.mainnet.chain.robinhood.com https://api.geckoterminal.com https://robinhoodchain.blockscout.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and API routes (JSON responses do not need a CSP).
    "/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image).*)",
  ],
};
