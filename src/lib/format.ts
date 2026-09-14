/** Display helpers. Every function returns "—" for missing data: nothing is ever invented. */

export function truncateAddress(addr: string | undefined | null, head = 6, tail = 4): string {
  if (!addr) return "—";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

/** 1234567 → $1.23M (mirrors the original's `fmt`). */
export function fmtUsd(n: number | null | undefined, opts: { zero?: string } = {}): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n === 0) return opts.zero ?? "$0";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

/** Adaptive precision for tiny memecoin prices (mirrors the original). */
export function fmtPrice(p: number | null | undefined): string {
  if (p === null || p === undefined || Number.isNaN(p) || p <= 0) return "—";
  const digits = p < 0.0001 ? 10 : p < 0.001 ? 8 : p < 1 ? 6 : 2;
  return `$${p.toFixed(digits)}`;
}

export function fmtSupply(n: number | null | undefined): string {
  if (!n || n <= 0) return "—";
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString("en-US");
}

export function fmtPct(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v.toFixed(digits)}%`;
}

export function fmtDelta(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${v >= 0 ? "▲" : "▼"}${Math.abs(v).toFixed(1)}%`;
}

export function fmtEth(wei: bigint | string | null | undefined, digits = 4): string {
  if (wei === null || wei === undefined) return "—";
  const v = typeof wei === "string" ? BigInt(wei) : wei;
  const whole = v / 10n ** 18n;
  const frac = v % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, "0").slice(0, digits);
  return `${whole.toString()}${digits > 0 ? "." + fracStr : ""}`;
}

export function fmtUnits(
  raw: bigint | string | null | undefined,
  decimals: number,
  digits = 2,
): string {
  if (raw === null || raw === undefined) return "—";
  const v = typeof raw === "string" ? BigInt(raw) : raw;
  const base = 10n ** BigInt(decimals);
  const whole = v / base;
  const frac = v % base;
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, digits);
  return `${whole.toLocaleString("en-US")}${digits > 0 ? "." + fracStr : ""}`;
}

/** "3d 04h" / "04h 12m" / "12m" — countdown for the next Aid Drop. */
export function fmtCountdown(ms: number): string {
  if (ms <= 0) return "closing";
  const totalMin = Math.floor(ms / 60_000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${String(h).padStart(2, "0")}h`;
  if (h > 0) return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  return `${m}m`;
}

export function fmtDateUtc(iso: string | number | Date | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

export function fmtDateTimeUtc(iso: string | number | Date | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} UTC`;
}

export function hostnameOf(url: string | undefined | null): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
