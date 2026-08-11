"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useMotionPreference } from "@/lib/motion-preference";
import { posts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  group: "Go to" | "Projects" | "Writing" | "Actions";
  hint?: string;
  keywords?: string;
  run: () => void;
}

export default function CommandPalette() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const {
    resolved: motion,
    setPreference: setMotion,
    toggleMotion,
  } = useMotionPreference();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const openExternal = useCallback(
    (href: string) => {
      close();
      window.open(href, "_blank", "noopener,noreferrer");
    },
    [close],
  );

  const commands = useMemo<Command[]>(() => {
    const navigation: Command[] = [
      { id: "home", label: "Home", group: "Go to", run: () => go("/") },
      {
        id: "projects",
        label: "Projects",
        group: "Go to",
        run: () => go("/projects"),
      },
      {
        id: "writing",
        label: "Writing",
        group: "Go to",
        run: () => go("/writing"),
      },
      { id: "resume", label: "Resume", group: "Go to", run: () => go("/resume") },
    ];

    const projectCommands: Command[] = projects.map((project) => ({
      id: `project-${project.slug}`,
      label: project.name,
      group: "Projects",
      hint: project.tagline,
      keywords: project.stack.join(" "),
      run: () => go(`/projects/${project.slug}`),
    }));

    const postCommands: Command[] = posts.map((post) => ({
      id: `post-${post.slug}`,
      label: post.title,
      group: "Writing",
      hint: post.description,
      keywords: post.tags.join(" "),
      run: () => go(`/writing/${post.slug}`),
    }));

    const actions: Command[] = [
      {
        id: "copy-email",
        label: "Copy email address",
        group: "Actions",
        hint: site.email,
        run: async () => {
          try {
            await navigator.clipboard.writeText(site.email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          } catch {
            window.location.href = `mailto:${site.email}`;
          }
          close();
        },
      },
      {
        id: "download-resume",
        label: "Download resume (PDF)",
        group: "Actions",
        run: () => {
          close();
          window.open("/resume.pdf", "_blank", "noopener,noreferrer");
        },
      },
      {
        id: "toggle-theme",
        label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`,
        group: "Actions",
        keywords: "dark light mode appearance",
        run: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          close();
        },
      },
      {
        id: "system-theme",
        label: "Match system theme",
        group: "Actions",
        keywords: "auto appearance",
        run: () => {
          setTheme("system");
          close();
        },
      },
      {
        id: "toggle-motion",
        label: motion === "full" ? "Turn animations off" : "Turn animations on",
        group: "Actions",
        hint: motion === "full" ? "animations on" : "animations off",
        keywords: "motion animation reduced transition accessibility",
        run: () => {
          toggleMotion();
          close();
        },
      },
      {
        id: "system-motion",
        label: "Match system motion setting",
        group: "Actions",
        keywords: "motion animation reduced auto accessibility",
        run: () => {
          setMotion("system");
          close();
        },
      },
      {
        id: "terminal",
        label: "Open terminal",
        group: "Actions",
        hint: "or press ~",
        keywords: "cli shell console",
        run: () => {
          close();
          window.dispatchEvent(new CustomEvent("portfolio:open-terminal"));
        },
      },
      {
        id: "github",
        label: "GitHub",
        group: "Actions",
        hint: site.githubUser,
        run: () => openExternal(site.github),
      },
      {
        id: "twitter",
        label: "Twitter / X",
        group: "Actions",
        hint: site.twitterHandle,
        run: () => openExternal(site.twitter),
      },
      {
        id: "rss",
        label: "RSS feed",
        group: "Actions",
        keywords: "feed subscribe",
        run: () => openExternal("/feed.xml"),
      },
    ];

    return [...navigation, ...projectCommands, ...postCommands, ...actions];
  }, [
    close,
    go,
    openExternal,
    resolvedTheme,
    setTheme,
    motion,
    setMotion,
    toggleMotion,
  ]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.hint ?? ""} ${command.keywords ?? ""} ${command.group}`
        .toLowerCase()
        .includes(needle),
    );
  }, [commands, query]);

  // Global shortcut.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock scrolling and focus the input while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    if (!open) return;
    const active = listRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) =>
          (index - 1 + Math.max(results.length, 1)) %
          Math.max(results.length, 1),
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      results[activeIndex]?.run();
    }
  };

  if (!open) {
    return copied ? (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-md border border-muted-black/20 bg-surface px-3 py-1.5 font-mono text-xs text-body shadow-sm">
        email copied
      </div>
    ) : null;
  }

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 bg-overlay/40 backdrop-blur-[2px] cursor-default"
      />

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-muted-black/25 bg-background shadow-xl"
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          placeholder="Search projects, posts, actions…"
          aria-label="Search commands"
          className="w-full bg-transparent px-4 py-3 font-jost text-sm text-foreground outline-none placeholder:text-muted-black/70 border-b border-muted-black/20"
        />

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center font-mono text-xs text-muted-black">
              nothing matches “{query}”
            </p>
          ) : (
            results.map((command, index) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;

              return (
                <div key={command.id}>
                  {showGroup && (
                    <div className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-muted-black/70">
                      {command.group}
                    </div>
                  )}
                  <button
                    type="button"
                    data-active={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => command.run()}
                    className={cn(
                      "flex w-full items-baseline justify-between gap-3 px-4 py-2 text-left transition-colors",
                      index === activeIndex ? "bg-accent/15" : "bg-transparent",
                    )}
                  >
                    <span className="font-sans text-sm text-title">
                      {command.label}
                    </span>
                    {command.hint ? (
                      <span className="truncate font-mono text-[11px] text-muted-black max-w-[45%]">
                        {command.hint}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-muted-black/20 px-4 py-2 font-mono text-[10px] text-muted-black">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>~ terminal</span>
        </div>
      </div>
    </div>
  );
}
