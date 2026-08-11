"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import Logo from "@/components/logo";
import { useMotionPreference } from "@/lib/motion-preference";

/**
 * The name, in his own handwriting, drawn on when it scrolls into view.
 * Reuses the same single-path SVG the page transition animates.
 */
export default function Signature() {
  const svgRef = useRef<SVGSVGElement>(null);
  // Re-arms when the motion toggle flips, so switching animations on redraws
  // the signature instead of waiting for a reload.
  const { prefersReducedMotion } = useMotionPreference();

  useEffect(() => {
    const svg = svgRef.current;
    const path = svg?.querySelector("path");
    if (!svg || !path) return;

    if (prefersReducedMotion) {
      gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0 });
      return;
    }

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const draw = () =>
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2.4,
        ease: "power1.inOut",
      });

    // Already on screen (e.g. after flipping the toggle) — just draw it.
    const rect = svg.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const tween = draw();
      return () => {
        tween.kill();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          draw();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(svg);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div className="w-full flex justify-center pt-10 pb-4 select-none">
      <Logo
        ref={svgRef}
        color="currentColor"
        width="100%"
        height="auto"
        aria-label="Bhavesh Singhal"
        role="img"
        className="w-full max-w-[300px] h-auto text-muted-black"
      />
    </div>
  );
}
