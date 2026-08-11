"use client";

import { useEffect } from "react";
import { useMotionPreference } from "@/lib/motion-preference";

/**
 * Keeps <html data-motion> honest after first paint — specifically when the
 * preference is "system" and the OS setting changes mid-session. Renders
 * nothing; the inline script in layout.tsx handles the initial value.
 */
export default function MotionSync() {
  const { resolved } = useMotionPreference();

  useEffect(() => {
    document.documentElement.dataset.motion = resolved;
  }, [resolved]);

  return null;
}
