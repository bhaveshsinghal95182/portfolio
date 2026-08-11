"use client";

import { Zap, ZapOff } from "lucide-react";
import { useMotionPreference } from "@/lib/motion-preference";
import { cn } from "@/lib/utils";

export default function MotionToggle({ className }: { className?: string }) {
  const { resolved, preference, toggleMotion } = useMotionPreference();
  const animationsOn = resolved === "full";

  const label = animationsOn
    ? "Turn animations off"
    : `Turn animations on${preference === "system" ? " (your system asks for reduced motion)" : ""}`;

  return (
    <button
      type="button"
      onClick={toggleMotion}
      aria-label={label}
      aria-pressed={animationsOn}
      title={label}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-md cursor-pointer transition-colors duration-200 hover:bg-muted-black/10",
        animationsOn ? "text-foreground" : "text-muted-black",
        className,
      )}
    >
      {animationsOn ? (
        <Zap width={17} height={17} />
      ) : (
        <ZapOff width={17} height={17} />
      )}
    </button>
  );
}
