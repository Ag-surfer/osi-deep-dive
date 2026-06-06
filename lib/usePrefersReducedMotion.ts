"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function getSnapshot() {
  return typeof window !== "undefined" && !!window.matchMedia?.(QUERY).matches;
}
function getServerSnapshot() {
  return false;
}

/**
 * Whether the user prefers reduced motion. Read via useSyncExternalStore so it
 * reconciles cleanly across hydration (no SSR/client mismatch) — unlike reading
 * matchMedia directly during render.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
