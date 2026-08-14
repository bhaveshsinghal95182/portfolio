"use client";

import { animate, motion, useMotionValue } from "motion/react";
import type { MotionValue } from "motion/react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTheme } from "@/components/theme-provider";
import {
  setMotionPreference,
  useMotionPreference,
  type MotionPreference,
} from "@/lib/motion-preference";
import { posts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

interface Line {
  id: number;
  kind: "input" | "output" | "error";
  text: string;
}

/** Where the window lives: pinned to an edge, or loose in the middle. */
type Dock = "left" | "top" | "bottom" | "right" | "float";

interface Point {
  x: number;
  y: number;
}

interface Rect extends Point {
  width: number;
  height: number;
}

/** [top-left, top-right, bottom-right, bottom-left] */
type Radii = [number, number, number, number];

interface Sizes {
  /** Height of a top/bottom dock. */
  band: number;
  /** Width of a left/right dock. */
  column: number;
  floatWidth: number;
  floatHeight: number;
}

const PROMPT = "bhavesh@portfolio:~$";
const STORAGE_KEY = "terminal:layout";

const DOCKS: Dock[] = ["left", "top", "bottom", "right", "float"];
const DOCK_LABEL: Record<Dock, string> = {
  left: "Dock left",
  top: "Dock top",
  bottom: "Dock bottom",
  right: "Dock right",
  float: "Float",
};

const MIN_BAND = 160;
const MIN_COLUMN = 260;
const MIN_FLOAT_WIDTH = 320;
const MIN_FLOAT_HEIGHT = 200;
/** Breathing room kept between a floating window and the viewport edge. */
const FLOAT_MARGIN = 16;
/** How much of a dragged window must stay on screen to grab it back. */
const GRAB_MARGIN = 96;
const RADIUS = 14;

const DEFAULT_SIZES: Sizes = {
  band: 340,
  column: 380,
  floatWidth: 640,
  floatHeight: 420,
};

/* Position leads, size follows a touch softer — the window reads as if it is
   stretching into its new home rather than teleporting there. */
const GLIDE = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 0.9,
};
const STRETCH = {
  type: "spring" as const,
  stiffness: 250,
  damping: 30,
  mass: 1,
};
const EASE_OUT: [number, number, number, number] = [0.32, 0.72, 0, 1];
const CORNERS = { duration: 0.35, ease: EASE_OUT };
const PILL = { type: "spring" as const, stiffness: 420, damping: 34 };
const INSTANT = { duration: 0 };

const HELP = [
  "available commands",
  "",
  "  help              show this message",
  "  ls [dir]          list projects, writing, or links",
  "  cat <slug>        read a project or post summary",
  "  open <slug|url>   navigate to a page or open a link",
  "  whoami            short bio",
  "  email             copy the email address",
  "  resume            open the resume",
  "  dock <side>       left | top | bottom | right | float",
  "  theme <mode>      dark | light | system",
  "  motion <mode>     on | off | system",
  "  clear             clear the screen",
  "  exit              close the terminal (or press esc)",
  "",
  "  drag the inner edge to resize, ctrl+alt+arrows to re-dock",
];

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

interface Layout {
  dock: Dock;
  sizes: Sizes;
  floatPos: Point | null;
}

const DEFAULT_LAYOUT: Layout = {
  dock: "bottom",
  sizes: DEFAULT_SIZES,
  floatPos: null,
};

/** False on the server and through hydration, true from the render after it —
    which is how the stored layout gets in without desyncing the markup. */
const subscribeToNothing = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

function readLayout(): Layout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const saved = JSON.parse(raw) as Partial<Layout>;
    return {
      dock:
        saved.dock && DOCKS.includes(saved.dock)
          ? saved.dock
          : DEFAULT_LAYOUT.dock,
      sizes: { ...DEFAULT_SIZES, ...saved.sizes },
      floatPos: saved.floatPos ?? null,
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

/** Keeps stored sizes inside what the current viewport can actually show. */
function clampSizes(sizes: Sizes, vw: number, vh: number): Sizes {
  return {
    band: clamp(sizes.band, MIN_BAND, Math.max(MIN_BAND, vh - 56)),
    column: clamp(sizes.column, MIN_COLUMN, Math.max(MIN_COLUMN, vw - 56)),
    floatWidth: clamp(
      sizes.floatWidth,
      MIN_FLOAT_WIDTH,
      Math.max(MIN_FLOAT_WIDTH, vw - FLOAT_MARGIN * 2),
    ),
    floatHeight: clamp(
      sizes.floatHeight,
      MIN_FLOAT_HEIGHT,
      Math.max(MIN_FLOAT_HEIGHT, vh - FLOAT_MARGIN * 2),
    ),
  };
}

/** A floating window may hang off an edge, but never far enough to lose it. */
function clampFloatPos(
  pos: Point,
  width: number,
  height: number,
  vw: number,
  vh: number,
): Point {
  return {
    x: clamp(pos.x, GRAB_MARGIN - width, vw - GRAB_MARGIN),
    y: clamp(pos.y, 0, Math.max(0, vh - Math.min(height, 56))),
  };
}

function layoutFor(
  dock: Dock,
  rawSizes: Sizes,
  floatPos: Point | null,
  vw: number,
  vh: number,
): { rect: Rect; radii: Radii } {
  const sizes = clampSizes(rawSizes, vw, vh);

  switch (dock) {
    case "bottom":
      return {
        rect: { x: 0, y: vh - sizes.band, width: vw, height: sizes.band },
        radii: [RADIUS, RADIUS, 0, 0],
      };
    case "top":
      return {
        rect: { x: 0, y: 0, width: vw, height: sizes.band },
        radii: [0, 0, RADIUS, RADIUS],
      };
    case "left":
      return {
        rect: { x: 0, y: 0, width: sizes.column, height: vh },
        radii: [0, RADIUS, RADIUS, 0],
      };
    case "right":
      return {
        rect: { x: vw - sizes.column, y: 0, width: sizes.column, height: vh },
        radii: [RADIUS, 0, 0, RADIUS],
      };
    default: {
      const { floatWidth: width, floatHeight: height } = sizes;
      const centred: Point = {
        x: Math.round((vw - width) / 2),
        y: Math.round((vh - height) / 2),
      };
      const pos = floatPos
        ? clampFloatPos(floatPos, width, height, vw, vh)
        : centred;
      return {
        rect: { ...pos, width, height },
        radii: [RADIUS, RADIUS, RADIUS, RADIUS],
      };
    }
  }
}

/** Where the window starts on open — just off its edge, so it slides in. */
function entryPoint(dock: Dock, rect: Rect): Point {
  switch (dock) {
    case "bottom":
      return { x: rect.x, y: rect.y + rect.height * 0.4 };
    case "top":
      return { x: rect.x, y: rect.y - rect.height * 0.4 };
    case "left":
      return { x: rect.x - rect.width * 0.35, y: rect.y };
    case "right":
      return { x: rect.x + rect.width * 0.35, y: rect.y };
    default:
      return { x: rect.x, y: rect.y + 24 };
  }
}

function DockGlyph({ dock }: { dock: Dock }) {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <rect
        x="1.6"
        y="2.6"
        width="12.8"
        height="10.8"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity={dock === "float" ? 0.45 : 0.9}
      />
      {dock === "left" && (
        <rect
          x="2.6"
          y="3.6"
          width="4"
          height="8.8"
          rx="1.2"
          fill="currentColor"
        />
      )}
      {dock === "right" && (
        <rect
          x="9.4"
          y="3.6"
          width="4"
          height="8.8"
          rx="1.2"
          fill="currentColor"
        />
      )}
      {dock === "top" && (
        <rect
          x="2.6"
          y="3.6"
          width="10.8"
          height="3.6"
          rx="1.2"
          fill="currentColor"
        />
      )}
      {dock === "bottom" && (
        <rect
          x="2.6"
          y="8.8"
          width="10.8"
          height="3.6"
          rx="1.2"
          fill="currentColor"
        />
      )}
      {dock === "float" && (
        <rect
          x="4.4"
          y="5.4"
          width="9.2"
          height="7.2"
          rx="1.6"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

export default function Terminal() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { resolved: motionResolved } = useMotionPreference();
  const reduced = motionResolved === "reduced";

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const hydrated = useHydrated();
  const [layout, setLayout] = useState<Layout>(readLayout);
  const { dock, sizes, floatPos } = hydrated ? layout : DEFAULT_LAYOUT;
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [gesturing, setGesturing] = useState<"move" | "resize" | null>(null);

  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  /** Skip the spring for this one update (opening, dragging, window resize). */
  const instantRef = useRef(false);
  const openingRef = useRef(false);
  const gestureRef = useRef<
    | ({
        mode: "move" | "resize";
        px: number;
        py: number;
        ox: number;
        oy: number;
      } & Sizes)
    | null
  >(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const cornerTL = useMotionValue(RADIUS);
  const cornerTR = useMotionValue(RADIUS);
  const cornerBR = useMotionValue(RADIUS);
  const cornerBL = useMotionValue(RADIUS);

  const print = useCallback(
    (text: string | string[], kind: Line["kind"] = "output") => {
      const chunks = Array.isArray(text) ? text : [text];
      setLines((previous) => [
        ...previous,
        ...chunks.map((chunk) => ({
          id: nextId.current++,
          kind,
          text: chunk,
        })),
      ]);
    },
    [],
  );

  const openTerminal = useCallback(() => {
    if (!openRef.current) openingRef.current = true;
    setOpen(true);
    setLines((previous) =>
      previous.length > 0
        ? previous
        : [
            {
              id: nextId.current++,
              kind: "output" as const,
              text: `${site.name} — type "help" to get started, "exit" to leave.`,
            },
          ],
    );
  }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Debounced so a resize drag doesn't hit storage on every frame.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      } catch {
        // Layout just won't persist.
      }
    }, 300);
    return () => clearTimeout(id);
  }, [layout]);

  useEffect(() => {
    const update = () => {
      instantRef.current = true;
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const moveTo = useCallback((next: Dock) => {
    setLayout((previous) => ({ ...previous, dock: next }));
    inputRef.current?.focus();
  }, []);

  // "~" opens it, unless the visitor is typing somewhere real.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.altKey && openRef.current) {
        const shortcuts: Record<string, Dock> = {
          ArrowLeft: "left",
          ArrowRight: "right",
          ArrowUp: "top",
          ArrowDown: "bottom",
          f: "float",
        };
        const next = shortcuts[event.key] ?? shortcuts[event.key.toLowerCase()];
        if (next) {
          event.preventDefault();
          moveTo(next);
        }
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key !== "~" && event.key !== "`") return;
      event.preventDefault();
      if (openRef.current) setOpen(false);
      else openTerminal();
    };

    const onOpenEvent = () => openTerminal();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("portfolio:open-terminal", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("portfolio:open-terminal", onOpenEvent);
    };
  }, [moveTo, openTerminal]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Re-docking changes the visible height, so the prompt has to be chased down.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, open, layout]);

  /* The whole dock/float dance lives here: every layout change resolves to one
     rect, and the motion values spring towards it. Drags and window resizes set
     instantRef so they track the pointer instead of lagging behind a spring. */
  useIsomorphicLayoutEffect(() => {
    if (!open || viewport.w === 0) return;

    const { rect, radii } = layoutFor(
      dock,
      sizes,
      floatPos,
      viewport.w,
      viewport.h,
    );
    const instant = instantRef.current || reduced;
    const opening = openingRef.current;
    instantRef.current = false;
    openingRef.current = false;

    const sizeAndCorners: [MotionValue<number>, number][] = [
      [width, rect.width],
      [height, rect.height],
      [cornerTL, radii[0]],
      [cornerTR, radii[1]],
      [cornerBR, radii[2]],
      [cornerBL, radii[3]],
    ];

    if (opening) {
      // Snap to the final size, then slide in from just outside the edge.
      for (const [mv, target] of sizeAndCorners) mv.jump(target);
      const from = entryPoint(dock, rect);
      x.jump(reduced ? rect.x : from.x);
      y.jump(reduced ? rect.y : from.y);
      if (reduced) return;
      const entrance = [animate(x, rect.x, GLIDE), animate(y, rect.y, GLIDE)];
      return () => entrance.forEach((control) => control.stop());
    }

    if (instant) {
      x.jump(rect.x);
      y.jump(rect.y);
      for (const [mv, target] of sizeAndCorners) mv.jump(target);
      return;
    }

    const controls = [
      animate(x, rect.x, GLIDE),
      animate(y, rect.y, GLIDE),
      animate(width, rect.width, STRETCH),
      animate(height, rect.height, STRETCH),
      animate(cornerTL, radii[0], CORNERS),
      animate(cornerTR, radii[1], CORNERS),
      animate(cornerBR, radii[2], CORNERS),
      animate(cornerBL, radii[3], CORNERS),
    ];
    return () => controls.forEach((control) => control.stop());
  }, [
    open,
    dock,
    sizes,
    floatPos,
    viewport,
    reduced,
    x,
    y,
    width,
    height,
    cornerTL,
    cornerTR,
    cornerBR,
    cornerBL,
  ]);

  const startGesture = useCallback(
    (mode: "move" | "resize") => (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      if (mode === "move") {
        if (dock !== "float") return;
        if ((event.target as HTMLElement).closest("button")) return;
      }
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      gestureRef.current = {
        mode,
        px: event.clientX,
        py: event.clientY,
        ox: x.get(),
        oy: y.get(),
        ...sizes,
      };
      setGesturing(mode);
    },
    [dock, sizes, x, y],
  );

  const onGestureMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      const dx = event.clientX - gesture.px;
      const dy = event.clientY - gesture.py;
      instantRef.current = true;

      if (gesture.mode === "move") {
        const moved = clampFloatPos(
          { x: gesture.ox + dx, y: gesture.oy + dy },
          width.get(),
          height.get(),
          viewport.w,
          viewport.h,
        );
        setLayout((previous) => ({ ...previous, floatPos: moved }));
        return;
      }

      const next: Sizes = {
        band: gesture.band,
        column: gesture.column,
        floatWidth: gesture.floatWidth,
        floatHeight: gesture.floatHeight,
      };
      switch (dock) {
        case "bottom":
          next.band = gesture.band - dy;
          break;
        case "top":
          next.band = gesture.band + dy;
          break;
        case "left":
          next.column = gesture.column + dx;
          break;
        case "right":
          next.column = gesture.column - dx;
          break;
        default:
          next.floatWidth = gesture.floatWidth + dx;
          next.floatHeight = gesture.floatHeight + dy;
      }
      const resized = clampSizes(next, viewport.w, viewport.h);
      setLayout((previous) => ({ ...previous, sizes: resized }));
    },
    [dock, height, viewport.h, viewport.w, width],
  );

  const endGesture = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gestureRef.current = null;
    setGesturing(null);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      print(`${PROMPT} ${input}`, "input");
      if (!input) return;

      setHistory((previous) => [...previous, input]);
      setHistoryIndex(null);

      const [command, ...args] = input.split(/\s+/);
      const argument = args.join(" ").toLowerCase();

      switch (command.toLowerCase()) {
        case "help":
          print(HELP);
          return;

        case "ls": {
          if (argument === "writing" || argument === "posts") {
            print(posts.map((post) => `  ${post.slug}  —  ${post.title}`));
            return;
          }
          if (argument === "links") {
            print([
              `  github    ${site.github}`,
              `  twitter   ${site.twitter}`,
              `  email     ${site.email}`,
            ]);
            return;
          }
          if (!argument || argument === "projects" || argument === ".") {
            print(
              projects.map(
                (project) => `  ${project.slug}  —  ${project.tagline}`,
              ),
            );
            return;
          }
          print(`ls: ${argument}: no such directory`, "error");
          return;
        }

        case "cat": {
          if (!argument) {
            print("cat: missing operand", "error");
            return;
          }
          const project = projects.find((item) => item.slug === argument);
          if (project) {
            print([
              project.name,
              "",
              project.caseStudy?.summary ?? project.tagline,
              "",
              `  stack:  ${project.stack.join(", ")}`,
              `  live:   ${project.url}`,
              `  more:   open ${project.slug}`,
            ]);
            return;
          }
          const post = posts.find((item) => item.slug === argument);
          if (post) {
            print([post.title, "", post.description, "", `  ${post.date}`]);
            return;
          }
          print(`cat: ${argument}: no such file`, "error");
          return;
        }

        case "open": {
          if (!argument) {
            print("open: missing operand", "error");
            return;
          }
          if (argument.startsWith("http")) {
            window.open(argument, "_blank", "noopener,noreferrer");
            return;
          }
          const routes: Record<string, string> = {
            home: "/",
            "/": "/",
            projects: "/projects",
            writing: "/writing",
            resume: "/resume",
          };
          const project = projects.find((item) => item.slug === argument);
          const post = posts.find((item) => item.slug === argument);
          const target =
            routes[argument] ??
            (project ? `/projects/${project.slug}` : null) ??
            (post ? `/writing/${post.slug}` : null);

          if (!target) {
            print(`open: ${argument}: not found`, "error");
            return;
          }
          print(`opening ${target}…`);
          setOpen(false);
          router.push(target);
          return;
        }

        case "whoami":
          print([
            site.name,
            "",
            `  ${site.headline}`,
            `  CS student at ${site.school}, based in ${site.location}.`,
            `  Builds developer tools, npm packages and small SaaS.`,
          ]);
          return;

        case "email":
          navigator.clipboard
            ?.writeText(site.email)
            .then(() => print(`copied ${site.email} to clipboard`))
            .catch(() => print(site.email));
          return;

        case "resume":
          print("opening /resume…");
          setOpen(false);
          router.push("/resume");
          return;

        case "dock": {
          const next = DOCKS.find((item) => item === argument);
          if (next) {
            moveTo(next);
            print(next === "float" ? "floating window" : `docked ${next}`);
            return;
          }
          print(
            `dock is ${dock}. usage: dock <left|top|bottom|right|float>`,
            argument ? "error" : "output",
          );
          return;
        }

        case "theme": {
          if (
            argument === "dark" ||
            argument === "light" ||
            argument === "system"
          ) {
            setTheme(argument);
            print(`theme set to ${argument}`);
            return;
          }
          print("usage: theme <dark|light|system>", "error");
          return;
        }

        case "motion": {
          const modes: Record<string, MotionPreference> = {
            on: "full",
            full: "full",
            off: "reduced",
            reduced: "reduced",
            system: "system",
          };
          const mode = modes[argument];
          if (!mode) {
            print(
              `motion is ${motionResolved === "full" ? "on" : "off"}. usage: motion <on|off|system>`,
              argument ? "error" : "output",
            );
            return;
          }
          setMotionPreference(mode);
          print(
            mode === "system"
              ? "motion now follows your system setting"
              : `motion ${mode === "full" ? "on" : "off"}`,
          );
          return;
        }

        case "clear":
          setLines([]);
          return;

        case "exit":
        case "q":
          setOpen(false);
          return;

        default:
          print(`command not found: ${command}. try "help".`, "error");
      }
    },
    [dock, moveTo, print, router, setTheme, motionResolved],
  );

  const floating = dock === "float";

  /* The panel stays mounted and hides itself instead of unmounting: the motion
     values that carry its geometry only reach the DOM once the element is live,
     so a freshly mounted panel would sit at 0×0 for its whole opening frame. */
  return (
    <motion.div
      role="dialog"
      aria-label="Terminal"
      aria-hidden={!open}
      inert={!open}
      style={{
        x,
        y,
        width,
        height,
        borderTopLeftRadius: cornerTL,
        borderTopRightRadius: cornerTR,
        borderBottomRightRadius: cornerBR,
        borderBottomLeftRadius: cornerBL,
        /* Showing and hiding is CSS, not motion: the panel must never depend on
           an animation frame to become visible. Visibility waits out the fade on
           the way down, and jumps straight to visible on the way up. */
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transitionProperty: "opacity, visibility",
        transitionDuration: "200ms, 0s",
        transitionDelay: open ? "0s, 0s" : "0s, 200ms",
        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
        }
      }}
      className={cn(
        "fixed left-0 top-0 z-50 flex flex-col overflow-hidden border border-[#3a3b33] bg-overlay/95 text-[#e3e4d8] backdrop-blur-xl",
        floating ? "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]" : "shadow-2xl",
        gesturing && "select-none",
      )}
    >
      {/* Title bar — doubles as the drag handle when floating. */}
      <div
        onPointerDown={startGesture("move")}
        onPointerMove={onGestureMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-[#3a3b33] px-2.5 py-1.5 font-mono text-[11px] text-[#a4a598]",
          floating &&
            (gesturing === "move"
              ? "cursor-grabbing touch-none"
              : "cursor-grab touch-none"),
        )}
      >
        <span className="min-w-0 flex-1 truncate">{PROMPT}</span>

        <div className="flex shrink-0 items-center gap-0.5">
          {DOCKS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => moveTo(item)}
              aria-label={DOCK_LABEL[item]}
              aria-pressed={dock === item}
              title={DOCK_LABEL[item]}
              className={cn(
                "relative rounded-md p-1 transition-colors",
                dock === item
                  ? "text-[#8fbe94]"
                  : "text-[#6f7065] hover:text-[#e3e4d8]",
              )}
            >
              {dock === item && (
                <motion.span
                  layoutId="terminal-dock-active"
                  transition={reduced ? INSTANT : PILL}
                  className="absolute inset-0 rounded-md bg-[#8fbe94]/15"
                />
              )}
              {/* inline-flex, not `block` — globals.css owns a `.block`
                      class for the page transition and would scale this away. */}
              <span className="relative inline-flex">
                <DockGlyph dock={item} />
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-1 rounded-md px-1.5 py-1 transition-colors hover:text-[#f07a7a]"
            aria-label="Close terminal"
          >
            esc
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-xs/relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <pre
            key={line.id}
            className={
              line.kind === "error"
                ? "text-[#f07a7a] whitespace-pre-wrap"
                : line.kind === "input"
                  ? "text-[#8fbe94] whitespace-pre-wrap"
                  : "whitespace-pre-wrap"
            }
          >
            {line.text || " "}
          </pre>
        ))}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            run(value);
            setValue("");
          }}
          className="flex items-center gap-2"
        >
          <span className="text-[#8fbe94] shrink-0">{PROMPT}</span>
          <input
            ref={inputRef}
            value={value}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (history.length === 0) return;
                const index =
                  historyIndex === null
                    ? history.length - 1
                    : Math.max(0, historyIndex - 1);
                setHistoryIndex(index);
                setValue(history[index]);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                if (historyIndex === null) return;
                const index = historyIndex + 1;
                if (index >= history.length) {
                  setHistoryIndex(null);
                  setValue("");
                  return;
                }
                setHistoryIndex(index);
                setValue(history[index]);
              }
            }}
            className="w-full bg-transparent outline-none text-[#e3e4d8] caret-[#f07a7a]"
          />
        </form>
      </div>

      {/* Resize: the inner edge when docked, the corner when floating. */}
      <div
        onPointerDown={startGesture("resize")}
        onPointerMove={onGestureMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        aria-hidden="true"
        className={cn(
          "absolute z-10 touch-none",
          dock === "bottom" && "inset-x-0 top-0 h-1.5 cursor-ns-resize",
          dock === "top" && "inset-x-0 bottom-0 h-1.5 cursor-ns-resize",
          dock === "left" && "inset-y-0 right-0 w-1.5 cursor-ew-resize",
          dock === "right" && "inset-y-0 left-0 w-1.5 cursor-ew-resize",
          floating && "bottom-0 right-0 h-4 w-4 cursor-nwse-resize",
        )}
      >
        {floating && (
          <svg
            viewBox="0 0 16 16"
            className="h-full w-full text-[#6f7065]"
            aria-hidden="true"
          >
            <path
              d="M15 9 9 15M15 13l-2 2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </div>
    </motion.div>
  );
}
