import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Rounds to one decimal, mirroring the original's `parseFloat(x.toFixed(1))`. */
export const round1 = (v: number) => Number.parseFloat(v.toFixed(1));

/** Deterministic 32-bit FNV-1a hash of a string (used to seed random-looking but reproducible choices). */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}
