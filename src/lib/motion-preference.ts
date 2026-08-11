"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Motion is a first-class preference, not just an OS setting.
 *
 * "system" follows prefers-reduced-motion; "full" and "reduced" override it in
 * either direction, so someone with reduced motion enabled globally can still
 * opt into the page transition here, and someone without it can switch the
 * animations off. The resolved value is mirrored onto <html data-motion> — the
 * inline script in layout.tsx stamps it before first paint — which is what CSS
 * and the non-React GSAP code read.
 */
export type MotionPreference = "system" | "full" | "reduced";
export type ResolvedMotion = "full" | "reduced";

export const MOTION_STORAGE_KEY = "motion";
const MOTION_EVENT = "portfolio:motion-change";
const QUERY = "(prefers-reduced-motion: reduce)";

export function readMotionPreference(): MotionPreference {
  try {
    const value = localStorage.getItem(MOTION_STORAGE_KEY);
    if (value === "full" || value === "reduced" || value === "system") {
      return value;
    }
  } catch {
    // Blocked storage — fall back to the OS setting.
  }
  return "system";
}

export function resolveMotion(preference: MotionPreference): ResolvedMotion {
  if (preference !== "system") return preference;
  return window.matchMedia(QUERY).matches ? "reduced" : "full";
}

/**
 * Synchronous read for code outside React (the GSAP page transition, the
 * signature draw). Reads the attribute rather than the media query so the
 * manual override is honoured.
 */
export function isMotionReduced(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.motion === "reduced";
}

export function setMotionPreference(preference: MotionPreference): void {
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, preference);
  } catch {
    // Preference just won't persist.
  }
  document.documentElement.dataset.motion = resolveMotion(preference);
  window.dispatchEvent(new Event(MOTION_EVENT));
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  window.addEventListener("storage", onChange);
  window.addEventListener(MOTION_EVENT, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(MOTION_EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}

/** Snapshots must be primitives so React can compare them cheaply. */
function getSnapshot(): string {
  const preference = readMotionPreference();
  return `${preference}|${resolveMotion(preference)}`;
}

function getServerSnapshot(): string {
  return "system|full";
}

export function useMotionPreference() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [preference, resolved] = snapshot.split("|") as [
    MotionPreference,
    ResolvedMotion,
  ];

  const setPreference = useCallback(
    (next: MotionPreference) => setMotionPreference(next),
    [],
  );

  const toggleMotion = useCallback(() => {
    setMotionPreference(resolved === "reduced" ? "full" : "reduced");
  }, [resolved]);

  return {
    preference,
    resolved,
    prefersReducedMotion: resolved === "reduced",
    setPreference,
    toggleMotion,
  };
}
