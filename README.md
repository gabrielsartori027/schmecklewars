# Schmeckle Wars — WW3 Dashboard + War Chest on Robinhood Chain

> **The only memecoin backed by human conflict — and the only one that does something about it.**
> Wars go up. Aid goes out.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind v4 · viem · Upstash Redis · Vercel.

The **WW3 Probability Index** is the engine: real military news from the last 24 h becomes attacks
between nations (Rick and Morty personas), animated on a world map; every attack moves stats, XP,
theater heat and the index. The **War Chest** is the theme: the creator share of `$CHMCO` trading
fees flows into a public Safe multisig on Robinhood Chain, and every 14 days the index decides how
the aid pool is split between neutral humanitarian organizations. Index = cause, War Chest = consequence.

The world is **canonical**: a server cron ingests the news into an append-only event log and every
visitor sees the same numbers (`/api/state`, `/api/events` are public, read-only, CORS-open).

---

## Phase 0 status (launch build)

| Area | Status |
|---|---|
| Scaffold, design tokens, self-hosted fonts, shell (header pills · 6-tab nav · ticker · footer + disclaimer) | ✅ |
| Shared-world server: `/api/cron/ingest` (Anthropic + web search → Zod → filters → dedup → append), `/api/events`, `/api/state`, `/api/treasury`, `/api/token`, hourly `/api/cron/heartbeat` | ✅ |
| Home: WarChestStrip · War Map (real countries, d3-geo Equal Earth, theater layer, simplified choreography portal → arc → impact → theater pulse) · latest event · "Where the aid goes" · nation cards | ✅ |
| Dossier (6 StatBars) · Doomsday (gauge + Theater Heat + tiers + methodology + risk factors + arsenal + **all** multipliers + Power Ranking) · War Log (Sync 15 s cooldown, source quality) | ✅ |
| War Chest (launch version): hero with Safe address + ETH/USDG balance + Epoch 1 countdown, flow, allocation ring, epoch card, partners (all `Candidate`), Proof of Aid empty state, Donate card (QR · EIP-681 · Add network), rules, Rick's note, disclaimer | ✅ |
| $CHMCO: CA + copy, Buy on Pons, Uniswap, Blockscout, network mini-guide, live price (GeckoTerminal → DexScreener), market stats, Rick's speech, tokenomics | ✅ |
| OG image (logo + tagline + live index), manifest, robots, sitemap, JSON-LD, nonce CSP + security headers | ✅ |
| Unit tests (Vitest, 39) · Playwright smoke of the 6 routes at 360 px and desktop (zero console errors, no horizontal overflow) | ✅ |
| Lighthouse mobile (simulated throttling, `next start`, no CDN): / 89–95 · /dossier 92 · /doomsday 90 · /log 97 · /warchest 94 · /token 93 — Accessibility 100 · Best Practices 100 · SEO 100 on all six; CLS ≤ 0.01; initial JS ≈ 243 KB gz | ✅ (gate ≥ 85) |
| Cut in Phase 0 (by the prompt's cut order): sounds · RadarChart · full 6 s choreography with HUD balloon · War Log filters · header sparkline · ⌘K | ⏭ Phase 1 |

**Nothing is invented anywhere.** No key → the cron answers `{ skipped: "no-key" }`; no Safe → "The Chest
opens at launch"; no CA → "drops at launch"; pool not indexed → "Price feed connecting…"; no partner
Confirmed → the aid pool carries over and the projected split says so.

---

## Quick start

```bash
pnpm install
cp .env.example .env.local      # fill what you have; everything is optional for a local run
pnpm dev                        # http://localhost:3000
```

Without Upstash the server keeps the world **in memory** (dev only). To test the choreography:

```bash
NEXT_PUBLIC_SIMULATION=true pnpm dev
# then click the yellow "SIM" pill in the header, or:
curl -X POST "http://localhost:3000/api/dev/simulate?n=3"
```

Simulated events are labelled `SIMULATION` everywhere, the route answers 404 on Vercel production and
refuses to touch an Upstash-backed world.

```bash
pnpm check        # typecheck + lint + unit tests + build
pnpm test         # Vitest
pnpm e2e          # Playwright (needs `pnpm build` first; it starts `pnpm start`)
pnpm analyze      # bundle analyzer
```

---

## Launch-day runbook (operator)

Do these in order. Every value goes into Vercel → Project → Settings → Environment Variables.

1. **Infra**
   - Upstash Redis (REST): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
   - `CRON_SECRET`: `openssl rand -hex 32`. Vercel sends it as `Authorization: Bearer …` to the crons.
   - `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`, default `claude-sonnet-5`, `ANTHROPIC_WEB_SEARCH_MAX_USES`, default 2).
   - Alchemy app on **Robinhood Chain** → `RPC_URL=https://robinhood-mainnet.g.alchemy.com/v2/<KEY>`.
   - **Vercel plan:** crons every 10 min require **Pro**. On Hobby, crons only run once a day — use an
     external scheduler (cron-job.org, GitHub Actions `schedule`) calling
     `GET https://<site>/api/cron/ingest` with header `Authorization: Bearer <CRON_SECRET>` every 10 min
     and `/api/cron/heartbeat` hourly. Cadence lives in `vercel.json`.
2. **Create the War Chest Safe** — Safe{Wallet} supports Robinhood Chain (chain 4663):
   `app.safe.global` → new Safe → network Robinhood Chain → 2-of-3 owners (three different devices,
   never the creator wallet's key alone) → copy the address → `NEXT_PUBLIC_WAR_CHEST_ADDRESS`.
   Optional sub-Safes for ops/reserve → `NEXT_PUBLIC_OPS_ADDRESS`, `NEXT_PUBLIC_RESERVE_ADDRESS`.
3. **Fund the creator wallet** with ETH on Robinhood Chain (canonical bridge:
   `portal.arbitrum.io/bridge?destinationChain=robinhood-chain&sourceChain=ethereum`, ~10 min) →
   `NEXT_PUBLIC_CREATOR_WALLET`.
4. **Launch on Pons v2** (`ponsfamily.com/launchpad/create`, quote asset ETH). Verify the current fee
   config on the launch screen (Sept 2026: 1 % trade fee, creator 70 % / protocol 30 %, optional creator
   tax ≤ 10 % — immutable per launch). Copy:
   - the **contract address** → `NEXT_PUBLIC_TOKEN_CA`;
   - the token page URL → `NEXT_PUBLIC_LAUNCHPAD_URL`;
   - (optional) a Uniswap link → `NEXT_PUBLIC_SWAP_URL` (default: `app.uniswap.org/explore/tokens/robinhood/<CA>`).
5. **Point the creator fees at the Safe.** Pons v2 keeps creator fees in escrow
   (`FeeEscrow 0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e`). From the creator wallet call
   `transferCreatorFeeRecipient(token, <WAR_CHEST_ADDRESS>)` (Blockscout → contract → Write). From then
   on the Safe claims the accrued fees itself (a Safe transaction calling the escrow's claim function).
   Until that call is made, claim manually and forward everything above 0.01 ETH to the Safe; record each
   forward — it is the `inflow:creator-fee` classification of Phase 1.
6. `GENESIS_TS` = ISO UTC of the launch (e.g. `2026-09-15T15:00:00Z`) = start of Epoch 1.
   `NEXT_PUBLIC_SITE_URL` = the production domain. **Redeploy.**
7. Check `/token`, `/warchest`, `/api/state`, `/api/treasury` (balance must match Blockscout),
   `/api/events` (events appear within ~10 min), the map animates on a second browser, the OG image
   (`/opengraph-image`) shows the live index.
8. Publish the X thread (`x-posts-schmeckle-wars-robinhood.md`), CA in the bio, pin.
9. First 24 h: watch `outflow:unknown` on the Safe (must be zero), confirm the creator share arrives,
   record the first forward/claim into the Safe, check the ingest metrics (`HGETALL sw:metrics:ingest`
   in Upstash: runs, appended, errors, lastError).

### Stablecoin note (divergence from the original spec)
Robinhood Chain's native stablecoin is **USDG** (Paxos Global Dollar,
`0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`, listed in the official docs). Circle does not list a
native USDC on the chain. The chest therefore tracks ETH + USDG; change `NEXT_PUBLIC_STABLE_*` if you
prefer another token. Confirm the contract on Blockscout before launch.

---

## Vault operation (Phase 1 preview — not code of the site)

- Epoch close (every 14 days, UTC): open `/warchest`, read the Allocation Snapshot (Phase 1 publishes
  the JSON and its SHA-256 through a 0-ETH self-transaction from `PUBLISHER_ADDRESS`; that key is a
  separate hot wallet holding ~0.01 ETH — **never** a Safe owner key, never the creator key).
- Create the Safe transactions: bridge out of Robinhood Chain (canonical bridge withdrawal takes
  **~7 days** — Arbitrum challenge period; Across / Relay / Jumper are faster routes listed in the
  Robinhood docs), then the donation to the organization's published address (most receive on Ethereum
  mainnet or via The Giving Block).
- Register each leg in `data/aid-drops.json` (`Scheduled → Snapshot → Proposed → Executed → Verified`);
  the site verifies every leg on-chain and only then shows `Verified`.
- **Before confirming any partner:** neutral, registered, non-profit humanitarian organization; written
  confirmation that it accepts crypto (public `confirmationUrl`); sanctions screening (OFAC SDN, EU, UN
  lists) of the organization and the receiving address; never a government, army, armed group or party
  to a conflict. Repeat the screening before every disbursement.
- Get a legal review of the whole mechanism (securities, charity solicitation, tax) in your jurisdiction
  before the first Aid Drop. The disclaimer on every page is not a substitute.

---

## Architecture

```
src/
  app/                 routes: / dossier doomsday log warchest token · api/* · opengraph-image · manifest/robots/sitemap
  components/          shell · map (d3-geo) · home · nation · doomsday · log · warchest · token · engine (toast, level-up)
  config/              THE DATA (copied verbatim from the original): nations, stats, evolution, tiers, ww3, theaters,
                       keywords, stop-words, sources, rick-lines, doomsday, partners, epochs, treasury, token, site, ingest-prompt
  lib/domain/          pure, tested: ww3 · theaters · attacks · evolution · dedup · relevance · world (fold) · epochs · allocation
  lib/server/          kv (Upstash / memory) · event-log (ULID ZSET) · snapshot · ingest · treasury (viem) · token-price · http · rate-limit
  hooks/ store/        useWorldSync (state 10 min · events 60 s · WarEngine queue) · useProjected · zustand stores
```

**The world is a fold.** `fold(log)` is deterministic and exact under chunking:
`fold(all) === fold(tail, seed = fold(head))` — tested. A stored snapshot always refers to the time of
the last attack (`at`); projecting to "now" (decay of the index and of theater heat) is a separate,
never-persisted step, so the server snapshot and every client compute the same number. `source_upgrade`
entries (a better source for an existing story) touch neither numbers nor `at`.

**Event log:** Upstash ZSET, all scores 0, members `${ulid}#${json}` → lexicographic order is
chronological, `since` cursors are exact, the log is append-only (`/api/events?since=<ulid>&limit=100`).

**Ingest (every 10 min, lock `SET NX EX 55`, round-robin over 3 queries):** Anthropic Messages API with
the `web_search_20250305` server tool (`max_uses` 2), prompt in `config/ingest-prompt.ts` (v2.1.0, based
on the `schmeckle-wars-v2` prompt: UKRAINE added, `th` added, real event date), last JSON array in the
text blocks → Zod → ≥ 2 war keywords → talk-only filter → today/yesterday → dedup vs the last 200 →
append → snapshot → metrics. Retries on 429/529 are handled by the SDK (3, honouring `retry-after`).

**Cost (launch settings):** 144 runs/day × ≤ 2 searches = ≤ 288 searches/day (US$10 per 1 000) plus
tokens. Change `vercel.json` and `ANTHROPIC_WEB_SEARCH_MAX_USES` to tune.

**Client:** `/api/state` on load and every 10 min (canonical truth), `/api/events` every 60 s while the
tab is visible; new attacks go through the WarEngine queue (max 15, one at a time, 6 000 ms + 800 ms; a
burst animates the 3 newest and folds the rest instantly). Only preferences are persisted
(`schmeckle-wars:prefs`); the old `sw-stats` key is removed.

**Security:** nonce-based CSP (`script-src 'self' 'nonce-…' 'strict-dynamic'`) from `src/proxy.ts`,
HSTS, nosniff, DENY framing, Permissions-Policy; secrets only on the server; crons require
`CRON_SECRET`; read routes are rate-limited (60 req/min per IP); no wallet connect, no signatures, no
seed phrases — ever.

---

## Deviations from the prompt (with reasons)

| Prompt | Built | Why |
|---|---|---|
| Next.js 15 | **Next.js 16.3.5** | Latest stable, as the prompt asks ("versões estáveis mais recentes"). `middleware.ts` → `proxy.ts`. |
| TypeScript latest | **5.9.3** (7.0 exists) | TS 7 is a brand-new major (native compiler); `typescript-eslint` / `eslint-config-next` support is not there yet. |
| ESLint latest | **9.39** (10 exists) | `eslint-plugin-react` used by `eslint-config-next` breaks on ESLint 10. |
| `next/font/google` | `next/font/local` with the same three families (latin, variable) | Zero CDN at runtime *and* at build time (Google Fonts can fail during a Vercel build); files + licenses in `src/fonts/`. |
| shadcn/ui | shadcn-style primitives (cva + tailwind-merge + Radix Dialog), own code | Same conventions, no CLI-generated tree to maintain on launch day. |
| USDC in the chest | **USDG** (configurable) | Native stable of Robinhood Chain; no native Circle USDC on the chain (verified Sept 2026). |
| Forward script for creator fees | Pons v2 `transferCreatorFeeRecipient` → Safe (documented) | The launchpad allows pointing the recipient at the Safe; the script becomes optional. |
| Cron `*/5` | `*/10`, `max_uses` 2 | Cost control at launch; one-line change in `vercel.json` / env. Requires Vercel Pro (Hobby = daily crons). |
| Sound toggle in the header | omitted in Phase 0 | The audio engine is Phase 1; a toggle that does nothing would be dishonest. |
| Motion (`motion/react`) | not in the Phase 0 bundle — CSS keyframes + a 30-line FLIP hook | Motion shipped 48 KB gz in the initial JS even with `LazyMotion`/`m` under Turbopack; removing it took Lighthouse mobile from 61 to ≥ 85. Re-add lazily in Phase 1 for the full choreography if wanted. |
| `--fg-muted: #6B7681` · Recruit `#555` · Soldier `#888` | `#7E8A95` · `#8A96A2` · `#B3BCC6` | The prompt also requires contrast ≥ 4.5:1; the original values sit at 4.1 / 2.4 / 3.3 on the surfaces. Rings and dots still use the nation/tier colors. |
| Zod in the client | `src/lib/public-env.ts` (plain parsing) for every NEXT_PUBLIC_* read by client code; zod only on the server | Zod 4 alone was 92 KB gz of client JS. |
| Header sparkline, RadarChart, ⌘K, log filters, full 6 s choreography | Phase 1 | Explicitly in the prompt's cut order. |
| `tp` enum for the model | still `military\|nuclear\|cyber\|intel` | Same as the original prompt; diplomacy/economy are accepted by Zod but never requested (original behaviour). |
| — | `ICBM` keyword normalized to lowercase | Latent bug in the original: the set was compared against lowercased words. |
| — | hourly heat sample already recorded by the heartbeat | Phase 1 charts need history from day one; it cannot be backfilled. |
| Static pages | all pages dynamic | Required for the per-request CSP nonce (Next stamps the nonce only on dynamically rendered pages). |

Bugs of the original fixed (prompt §14): 1 (`yesterday` undefined), 2 (per-visitor API calls → cron),
3 (CORS only on audit routes), 4 (parser handles tool blocks), 5 (no opacity < .6 text, no 5–8 px text),
6 (shared world), 7 (mute persisted; no audio yet), 8 (all multipliers), 9 (no `@import` fonts),
10 (no `foreignObject`/`<img>` in SVG — native SVG emblems), 11 (no dev message), 12 (no
`JSON.parse(JSON.stringify())`).

---

## Reference

`reference/` (git-ignored) holds a read-only clone of the original repository and the `v2-App.jsx`
whose news prompt is the base of the ingest prompt. Nothing from the original character images is
used; every emblem is an original SVG glyph.
