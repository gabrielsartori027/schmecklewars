import { chromium } from "@playwright/test";
const [,, url] = process.argv;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const info = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const clipped = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === "hidden" || o === "auto" || o === "scroll" || o === "clip") return true;
      p = p.parentElement;
    }
    return false;
  };
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && !clipped(el)) out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 70)} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
  }
  return { html: document.documentElement.scrollWidth, body: document.body.scrollWidth, vw, out: out.slice(0, 12) };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
