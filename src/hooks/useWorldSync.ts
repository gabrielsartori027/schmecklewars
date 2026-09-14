"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { EventsResponse, StateResponse } from "@/lib/api-types";
import { ATTACK_DURATION_MS, ATTACK_GAP_MS, useWorld } from "@/store/world";

export const STATE_RESYNC_MS = 10 * 60_000;
export const EVENTS_POLL_MS = 60_000;

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return (await r.json()) as T;
}

function saveDataMultiplier(): number {
  if (typeof navigator === "undefined") return 1;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return c?.saveData ? 2 : 1;
}

/**
 * Mount once. `/api/state` on load and every 10 min (canonical truth), `/api/events` every
 * 60 s from the local cursor (only while the tab is visible), then the WarEngine drains the
 * queue one attack at a time: 6 000 ms + 800 ms of breathing room (original timings).
 *
 * The store is updated inside the query functions (idempotent `bootstrap` / `receive`), so
 * a refetch can never be lost between renders.
 */
export function useWorldSync() {
  const mult = saveDataMultiplier();

  const stateQ = useQuery({
    queryKey: ["state"],
    queryFn: async () => {
      const data = await fetchJson<StateResponse>("/api/state");
      if (data.ok) useWorld.getState().bootstrap(data);
      return data;
    },
    refetchInterval: STATE_RESYNC_MS * mult,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: 2,
  });

  useEffect(() => {
    if (stateQ.isError) useWorld.getState().setStatus("error");
  }, [stateQ.isError]);

  const eventsQ = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const since = useWorld.getState().cursor;
      const data = await fetchJson<EventsResponse>(
        `/api/events?limit=100${since ? `&since=${since}` : ""}`,
      );
      if (data.ok) useWorld.getState().receive(data.events);
      return data;
    },
    enabled: stateQ.isSuccess,
    refetchInterval: EVENTS_POLL_MS * mult,
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    useWorld.getState().setFetching(eventsQ.isFetching);
  }, [eventsQ.isFetching]);

  const refetchEvents = eventsQ.refetch;
  useEffect(() => {
    useWorld.setState({
      syncNow: async () => {
        await refetchEvents();
      },
    });
  }, [refetchEvents]);

  // ── WarEngine drain loop ──
  const current = useWorld((s) => s.current);
  const queueLen = useWorld((s) => s.queue.length);
  const gapUntil = useRef(0);

  useEffect(() => {
    if (current || queueLen === 0) return;
    const wait = Math.max(0, gapUntil.current - Date.now());
    const id = window.setTimeout(() => useWorld.getState().startNext(), wait);
    return () => window.clearTimeout(id);
  }, [current, queueLen]);

  useEffect(() => {
    if (!current) return;
    const id = window.setTimeout(() => {
      gapUntil.current = Date.now() + ATTACK_GAP_MS;
      useWorld.getState().finishCurrent();
    }, ATTACK_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [current]);

  return { stateQ, eventsQ };
}
