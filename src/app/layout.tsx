import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE } from "@/config/site";
import { TOKEN } from "@/config/token";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";
import { LivingBackground } from "@/components/shell/LivingBackground";
import { Nav } from "@/components/shell/Nav";
import { Ticker } from "@/components/shell/Ticker";
import "./globals.css";

// Self-hosted variable fonts (see src/fonts/README.md): zero CDN, no build-time dependency on Google.
const spaceGrotesk = localFont({
  src: "../fonts/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--font-space-grotesk",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
const jetbrains = localFont({
  src: "../fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(TOKEN.siteUrl),
  title: { default: SITE.title, template: SITE.titleTemplate },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Schmeckle Wars",
    "$CHMCO",
    "WW3 dashboard",
    "Robinhood Chain",
    "War Chest",
    "memecoin",
    "humanitarian aid",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#06080B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: TOKEN.siteUrl,
  description: SITE.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the per-request nonce (set in proxy.ts) makes every page dynamic, which is what
  // lets Next.js stamp the nonce on its own scripts (strict CSP, no 'unsafe-inline').
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="relative min-h-dvh bg-bg-base text-fg-primary">
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LivingBackground />
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-black"
          >
            Skip to content
          </a>
          <div className="relative z-10 flex min-h-dvh flex-col">
            <Header />
            <Nav />
            <Ticker />
            <main
              id="main"
              className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-5 sm:px-6 sm:py-6"
            >
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        {process.env.VERCEL ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
