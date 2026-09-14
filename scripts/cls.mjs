import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true });
await page.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({ value: e.value, t: Math.round(e.startTime), nodes: (e.sources || []).map((s) => { const n = s.node; if (!n) return "?"; return (n.tagName || n.nodeName) + "." + String(n.className || "").slice(0, 50) + " prev=" + JSON.stringify(s.previousRect && { y: s.previousRect.y, h: s.previousRect.height }) + " cur=" + JSON.stringify(s.currentRect && { y: s.currentRect.y, h: s.currentRect.height }); }) });
    }
  }).observe({ type: "layout-shift", buffered: true });
});
const cdp = await page.context().newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
const shifts = await page.evaluate(() => window.__shifts);
for (const s of shifts) console.log(s.value.toFixed(4), s.t + "ms", s.nodes.join(" | "));
await browser.close();
