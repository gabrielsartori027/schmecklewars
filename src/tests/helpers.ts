import { monotonicFactory } from "ulid";
import { sourceQuality } from "@/config/sources";
import { theaterOf } from "@/config/theaters";
import type { LogEntry, NationCode, StatKey, Theater } from "@/lib/domain/types";

const ulid = monotonicFactory(() => 0.5);

export function makeEntry(
  over: Partial<LogEntry> & { a: NationCode; t: NationCode; receivedAt: number },
): LogEntry {
  const tp: StatKey = over.tp ?? "military";
  const th: Theater = over.th ?? theaterOf(over.a, over.t);
  return {
    id: over.id ?? ulid(over.receivedAt),
    kind: over.kind ?? "attack",
    receivedAt: over.receivedAt,
    a: over.a,
    t: over.t,
    h: over.h ?? `${over.a} launches missile strike on ${over.t} military base near border`,
    tp,
    sv: over.sv ?? 5,
    d: over.d ?? new Date(over.receivedAt).toISOString().slice(0, 10),
    th,
    url: over.url,
    sourceQuality: over.sourceQuality ?? sourceQuality(over.url),
    query: over.query ?? "test",
    modelId: over.modelId ?? "test-model",
    upgrades: over.upgrades,
  };
}
