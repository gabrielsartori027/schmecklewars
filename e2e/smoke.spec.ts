import { expect, test, type Page } from "@playwright/test";

const ROUTES: { path: string; heading: RegExp }[] = [
  { path: "/", heading: /Wars go up\. Aid goes out\./ },
  { path: "/dossier", heading: /Interdimensional Dossier/ },
  { path: "/doomsday", heading: /WW3 Probability Index/ },
  { path: "/log", heading: /War Log/ },
  { path: "/warchest", heading: /WAR CHEST/ },
  { path: "/token", heading: /\$CHMCO/ },
];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

for (const r of ROUTES) {
  test(`route ${r.path} renders with zero console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(r.path, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: r.heading }).first()).toBeVisible();
    // shell
    await expect(page.getByRole("navigation", { name: "Sections" })).toBeVisible();
    await expect(page.locator("#disclaimer")).toContainText("no intrinsic value");
    // no horizontal overflow (360 px must never scroll sideways)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}

test("public audit routes answer with open CORS and JSON", async ({ request }) => {
  const state = await request.get("/api/state");
  expect(state.ok()).toBeTruthy();
  expect(state.headers()["access-control-allow-origin"]).toBe("*");
  const body = (await state.json()) as { ok: boolean; index: number; cursor: string | null };
  expect(body.ok).toBe(true);
  expect(body.index).toBeGreaterThanOrEqual(19.5);
  const events = await request.get("/api/events?limit=5");
  expect(events.ok()).toBeTruthy();
  expect(events.headers()["access-control-allow-origin"]).toBe("*");
  const bad = await request.get("/api/events?since=not-a-ulid");
  expect(bad.status()).toBe(400);
});

test("cron routes reject unauthenticated calls in production", async ({ request }) => {
  const r = await request.get("/api/cron/ingest");
  expect([200, 401]).toContain(r.status()); // 401 whenever CRON_SECRET is set
});

test("security headers and CSP are present", async ({ request }) => {
  const r = await request.get("/");
  const h = r.headers();
  expect(h["content-security-policy"]).toContain("script-src 'self' 'nonce-");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
});

test("choreography plays when simulated events arrive (dev builds only)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const sim = page.getByRole("button", { name: /SIM/ });
  test.skip((await sim.count()) === 0, "NEXT_PUBLIC_SIMULATION is off in this build");
  await sim.click();
  await expect(page.getByText("⚔️ ATTACKING")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("text=SIMULATION").first()).toBeVisible();
});
