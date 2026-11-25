#!/usr/bin/env node
/**
 * Open a project page on the portfolio.
 *
 *   pnpm project recso
 *   pnpm project "company logos" --local
 *   pnpm project --list
 *   portfolio recso              # after `pnpm link --global`
 *
 * The project list is read from src/lib/projects.ts, so a new project works
 * here as soon as it works on the site. A dev server on :3000 wins over the
 * deployed site; --live forces production and --print only prints the URL.
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const LIVE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhavesh.recso.dev"
).replace(/\/$/, "");
const LOCAL_URL = (
  process.env.PORTFOLIO_LOCAL_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("-")));
const words = args.filter((arg) => !arg.startsWith("-"));
const query = words.join(" ").trim();

function usage() {
  console.log(`open a project page

usage
  pnpm project <project> [--local|--live] [--print]
  pnpm project --list
  portfolio <project>              after: pnpm link --global

options
  --local, -l   use the dev server on ${LOCAL_URL} (default when it is running)
  --live        use ${LIVE_URL}
  --print, -p   print the URL instead of opening a browser
  --list        list every project
  --help, -h    this message`);
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function readProjects() {
  const source = readFileSync(join(root, "src/lib/projects.ts"), "utf8");
  const projects = [];
  const pattern = /slug:\s*"([^"]+)"\s*,\s*\n\s*name:\s*"([^"]+)"/g;

  for (const match of source.matchAll(pattern)) {
    projects.push({ slug: match[1], name: match[2] });
  }

  if (projects.length === 0) {
    fail("could not read any projects from src/lib/projects.ts");
    process.exit(1);
  }

  return projects;
}

function listProjects(projects) {
  const width = Math.max(...projects.map((project) => project.slug.length));
  console.log("projects\n");
  for (const project of projects) {
    console.log(`  ${project.slug.padEnd(width)}  ${project.name}`);
  }
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findProject(projects, input) {
  const needle = normalize(input);
  if (!needle) return { matches: [] };

  const exact = projects.filter(
    (project) =>
      normalize(project.slug) === needle || normalize(project.name) === needle,
  );
  if (exact.length === 1) return { project: exact[0], matches: exact };

  const matches = projects.filter(
    (project) =>
      normalize(project.slug).includes(needle) ||
      normalize(project.name).includes(needle),
  );

  return matches.length === 1
    ? { project: matches[0], matches }
    : { matches };
}

async function devServerIsUp() {
  try {
    const response = await fetch(LOCAL_URL, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return false;
    return (await response.text()).includes("Bhavesh");
  } catch {
    return false;
  }
}

function openUrl(url) {
  if (flags.has("--print") || flags.has("-p")) {
    console.log(url);
    return;
  }

  const [command, commandArgs] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];

  console.log(`opening ${url}`);
  const child = spawn(command, commandArgs, {
    detached: true,
    stdio: "ignore",
  });
  child.on("error", () => {
    fail(`could not launch a browser; open this: ${url}`);
  });
  child.unref();
}

if (flags.has("--help") || flags.has("-h")) {
  usage();
  process.exit(0);
}

const projects = readProjects();

if (flags.has("--list")) {
  listProjects(projects);
  process.exit(0);
}

if (!query) {
  listProjects(projects);
  console.log("\nusage: pnpm project <project> [--local|--live] [--print]");
  process.exit(0);
}

const { project, matches } = findProject(projects, query);

if (!project) {
  if (matches.length === 0) {
    fail(`no project matches "${query}"`);
  } else {
    fail(
      `"${query}" matches more than one project:\n${matches
        .map((item) => `  ${item.slug}  ${item.name}`)
        .join("\n")}`,
    );
  }
  console.log("\nrun `pnpm project --list` to see every project.");
  process.exit(1);
}

const forcedLocal = flags.has("--local") || flags.has("-l");
const forcedLive = flags.has("--live");
const devUp = forcedLive ? false : await devServerIsUp();

if (forcedLocal && !devUp) {
  fail(`no dev server answered on ${LOCAL_URL}. Run \`pnpm dev\` first.`);
  process.exit(1);
}

const base = forcedLive ? LIVE_URL : devUp ? LOCAL_URL : LIVE_URL;
openUrl(`${base}/projects/${project.slug}`);
