"use client";

import gsap from "gsap";
import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isMotionReduced } from "@/lib/motion-preference";

interface PageTransitionProps {
  children: React.ReactNode;
  /** SVG element to animate (will be cloned so you can pass <Logo />). */
  svg: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  /** CSS selector used to find the path to draw inside the SVG. Defaults to first <path>. */
  pathSelector?: string;
  /** Number of column blocks for wipe animation. Default 20. */
  blocks?: number;
  /** Stroke color applied during animation (if not already set). */
  strokeColor?: string;
  /** Final fill color of the path. Default '#e3e4d8'. */
  fillColor?: string;
  /** Duration of stroke drawing animation. */
  drawDuration?: number;
  /** Duration of fill fade-in. */
  fillDuration?: number;
  /** Animation variant for block transition. */
  animation?:
    | "wipe"
    | "wipe-reverse"
    | "vertical"
    | "fade"
    | "mosaic"
    | "scale";
}

/** Visitors who ask for less motion — via the OS or the nav toggle — get plain,
 *  instant navigation. Read per-click so flipping the toggle takes effect
 *  immediately, without a reload. */
const prefersReducedMotion = isMotionReduced;

/**
 * Background tabs get no requestAnimationFrame, so a GSAP timeline started
 * there never advances and never fires onComplete. Since navigation hangs off
 * that callback, animating in a hidden tab would strand the visitor on the
 * page with every internal link dead. Skip the animation instead.
 */
const isDocumentHidden = () =>
  typeof document !== "undefined" && document.visibilityState === "hidden";

/** Belt and braces: if the timeline stalls for any reason, navigate anyway. */
const NAVIGATION_WATCHDOG_MS = 2500;

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  svg,
  pathSelector = "path",
  blocks = 20,
  strokeColor = undefined,
  fillColor = "#e3e4d8",
  drawDuration = 1,
  fillDuration = 1,
  animation = "wipe",
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const logoOverlayRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<SVGSVGElement | null>(null);
  const blockRef = useRef<HTMLDivElement[]>([]);
  const isTransitioning = useRef(false);

  // Defined before the effect that calls them so lexical order is honoured.
  function coverPage(url: string) {
    let navigated = false;
    let watchdog = 0;

    const navigate = () => {
      if (navigated) return;
      navigated = true;
      window.clearTimeout(watchdog);
      isTransitioning.current = false;
      router.push(url);
    };

    // The animation is decoration; the navigation is the contract. Never let
    // the first hold the second hostage.
    watchdog = window.setTimeout(navigate, NAVIGATION_WATCHDOG_MS);

    const tl = gsap.timeline({ onComplete: navigate });

  const pathEl = logoRef.current?.querySelector<SVGPathElement>(pathSelector) || logoRef.current?.querySelector("path");
    const pathLength = pathEl?.getTotalLength() || 0;

    switch (animation) {
      case "wipe":
        tl.to(blockRef.current, {
          scaleX: 1,
          duration: 0.4,
          stagger: 0.02,
          ease: "power2.out",
          transformOrigin: "left",
        });
        break;
      case "wipe-reverse":
        tl.to(blockRef.current, {
          scaleX: 1,
          duration: 0.4,
          stagger: { each: 0.02, from: "end" },
          ease: "power2.out",
          transformOrigin: "right",
        });
        break;
      case "vertical":
        tl.to(blockRef.current, {
          scaleY: 1,
          duration: 0.5,
          stagger: 0.025,
          ease: "power2.out",
          transformOrigin: "top",
        });
        break;
      case "fade":
        tl.to(blockRef.current, {
          opacity: 1,
          duration: 0.5,
          stagger: 0.015,
          ease: "power2.out",
        });
        break;
      case "mosaic":
        tl.to(blockRef.current, {
          scaleX: 1,
          duration: 0.45,
          stagger: { each: 0.015, from: "random" },
          ease: "power2.out",
        });
        break;
      case "scale":
        tl.to(blockRef.current, {
          scale: 1,
          duration: 0.5,
          stagger: { each: 0.02, from: "center" },
          ease: "back.out(1.4)",
        });
        break;
      default:
        tl.to(blockRef.current, {
          scaleX: 1,
          duration: 0.4,
          stagger: 0.02,
          ease: "power2.out",
          transformOrigin: "left",
        });
    }
    tl
      .set(logoOverlayRef.current, { opacity: 1 }, "-=0.2")
      .set(
        pathEl!,
        {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          fill: "transparent",
        },
        "-=0.2"
      )
      .to(pathEl!, {
        strokeDashoffset: 0,
        duration: drawDuration * 1.4, // Reduced from 2x to 0.8x
        ease: "power2.inOut",
      }, "-=0.5")
      .to(logoOverlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      }); // Removed the +0.5s wait
  }

  function revealPage() {
    if (prefersReducedMotion() || isDocumentHidden()) {
      gsap.set(blockRef.current, { scaleX: 0, scaleY: 0, opacity: 0 });
      isTransitioning.current = false;
      return;
    }

    switch (animation) {
      case "wipe":
        gsap.set(blockRef.current, { scaleX: 1, transformOrigin: "right" });
        gsap.to(blockRef.current, {
          scaleX: 0,
          duration: 0.4,
          stagger: 0.02,
          ease: "power2.out",
          transformOrigin: "right",
          onComplete: () => { isTransitioning.current = false; },
        });
        break;
      case "wipe-reverse":
        gsap.set(blockRef.current, { scaleX: 1, transformOrigin: "left" });
        gsap.to(blockRef.current, {
          scaleX: 0,
          duration: 0.4,
          stagger: { each: 0.02, from: "end" },
          ease: "power2.out",
          transformOrigin: "left",
          onComplete: () => { isTransitioning.current = false; },
        });
        break;
      case "vertical":
        gsap.set(blockRef.current, { scaleY: 1, transformOrigin: "bottom" });
        gsap.to(blockRef.current, {
          scaleY: 0,
          duration: 0.45,
          stagger: 0.02,
          ease: "power2.out",
          transformOrigin: "bottom",
          onComplete: () => { isTransitioning.current = false; },
        });
        break;
      case "fade":
        gsap.set(blockRef.current, { opacity: 1 });
        gsap.to(blockRef.current, {
          opacity: 0,
          duration: 0.35,
          stagger: 0.015,
          ease: "power2.out",
          onComplete: () => { isTransitioning.current = false; },
        });
        break;
      case "mosaic":
        gsap.set(blockRef.current, { scaleX: 1 });
        gsap.to(blockRef.current, {
          scaleX: 0,
          duration: 0.4,
          stagger: { each: 0.01, from: "random" },
          ease: "power2.in",
          onComplete: () => { isTransitioning.current = false; },
        });
        break;
      case "scale":
        gsap.set(blockRef.current, { scale: 1 });
        gsap.to(blockRef.current, {
          scale: 0,
          duration: 0.45,
          stagger: { each: 0.02, from: "center" },
          ease: "back.in(1.4)",
          onComplete: () => { isTransitioning.current = false; },
        });
        break;
      default:
        gsap.set(blockRef.current, { scaleX: 1, transformOrigin: "right" });
        gsap.to(blockRef.current, {
          scaleX: 0,
          duration: 0.4,
          stagger: 0.02,
          ease: "power2.out",
          transformOrigin: "right",
          onComplete: () => { isTransitioning.current = false; },
        });
    }
  }

  useEffect(() => {
    // A new route means any previous transition is over; clear the guard so a
    // stalled one can never leave the links permanently dead.
    isTransitioning.current = false;

    const createBlocks = () => {
      if (!overlayRef.current) return;
      overlayRef.current.innerHTML = "";
      blockRef.current = [];

      for (let i = 0; i < blocks; i++) {
        const block = document.createElement("div");
        block.className = "block";
        overlayRef.current.appendChild(block);
        blockRef.current.push(block);
      }
    };

    createBlocks();

    switch (animation) {
      case "wipe":
        gsap.set(blockRef.current, { scaleX: 0, transformOrigin: "left" });
        break;
      case "wipe-reverse":
        gsap.set(blockRef.current, { scaleX: 0, transformOrigin: "right" });
        break;
      case "vertical":
        gsap.set(blockRef.current, { scaleY: 0, transformOrigin: "top" });
        break;
      case "mosaic":
        gsap.set(blockRef.current, { scaleX: 0, transformOrigin: "center" });
        break;
      case "scale":
        gsap.set(blockRef.current, { scale: 0, transformOrigin: "center" });
        break;
      default:
        gsap.set(blockRef.current, { scaleX: 0, transformOrigin: "left" });
    }

    if (logoRef.current) {
      const path = logoRef.current.querySelector<SVGPathElement>(pathSelector) || logoRef.current.querySelector("path");
      if (path) {
        const pathLength = path.getTotalLength();
        path.dataset.length = String(pathLength);
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          fill: "transparent",
          ...(strokeColor ? { stroke: strokeColor } : {}),
        });
      }
    }

    revealPage();

    const handleRouteChange = (url: string) => {
      if (!isTransitioning.current) {
        isTransitioning.current = true;
        coverPage(url);
      }
    };

    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');
    const clickListener = (e: MouseEvent) => {
      // Let the browser/router handle the click untouched under reduced motion
      // or in a background tab, and never hijack modified clicks (new tab,
      // download, etc).
      if (
        prefersReducedMotion() ||
        isDocumentHidden() ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      e.preventDefault();
      const target = e.currentTarget as HTMLAnchorElement | null;
      if (!target) return;
      const url = target.getAttribute("href");
      if (url && url !== pathName) {
        handleRouteChange(url);
      }
    };
    links.forEach((lnk) => lnk.addEventListener("click", clickListener));

    return () => {
      links.forEach((lnk) => lnk.removeEventListener("click", clickListener));
    };
  }, [router, pathName, animation, blocks, pathSelector, strokeColor, fillColor, drawDuration, fillDuration]);

  return (
    <>
      <div ref={overlayRef} className="transition-overlay"></div>
      <div ref={logoOverlayRef} className="logo-overlay">
        <div className="logo-container">
          {React.cloneElement(svg, { ref: logoRef })}
        </div>
      </div>
      {children}
    </>
  );
};

export default PageTransition;
