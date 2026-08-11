"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  setMotionPreference,
  useMotionPreference,
  type MotionPreference,
} from "@/lib/motion-preference";
import { posts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

interface Line {
  id: number;
  kind: "input" | "output" | "error";
  text: string;
}

const PROMPT = "bhavesh@portfolio:~$";

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
  "  theme <mode>      dark | light | system",
  "  motion <mode>     on | off | system",
  "  clear             clear the screen",
  "  exit              close the terminal (or press esc)",
];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export default function Terminal() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { resolved: motionResolved } = useMotionPreference();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // "~" opens it, unless the visitor is typing somewhere real.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key !== "~" && event.key !== "`") return;
      event.preventDefault();
      setOpen((previous) => {
        if (previous) return false;
        openTerminal();
        return true;
      });
    };

    const onOpenEvent = () => openTerminal();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("portfolio:open-terminal", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("portfolio:open-terminal", onOpenEvent);
    };
  }, [openTerminal]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, open]);

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
          print(
            `command not found: ${command}. try "help".`,
            "error",
          );
      }
    },
    [print, router, setTheme, motionResolved],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 h-[60svh] border-t border-[#3a3b33] bg-overlay text-[#e3e4d8] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#3a3b33] px-4 py-1.5 font-mono text-[11px] text-[#a4a598]">
        <span>{PROMPT}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="hover:text-[#f07a7a] transition-colors"
          aria-label="Close terminal"
        >
          esc
        </button>
      </div>

      <div
        ref={scrollRef}
        className="h-[calc(100%-30px)] overflow-y-auto px-4 py-3 font-mono text-xs/relaxed"
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
    </div>
  );
}
