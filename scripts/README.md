# scripts/

Operator / QA helpers (not part of the site bundle).

- `shot.mjs <url> <out.png> <width> <height> [waitMs]` — screenshot a route with Playwright and print
  console errors. Set `CHROMIUM_PATH` to use a system Chromium.
- `overflow.mjs <url>` — lists elements that overflow a 360 px viewport (horizontal-scroll hunting).
- `cls.mjs` — records layout-shift entries (with source nodes) under slow-4G + 4× CPU throttling.
- `forward-creator-fees.ts` — Phase 1 (optional): forwards the creator share to the Safe when the
  launchpad's fee recipient cannot be pointed at the Safe directly. See README → runbook step 5.
