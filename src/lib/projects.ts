import { site } from "@/lib/site";

export type BadgeAccent = "red" | "blue" | "green" | "purple";

export interface CaseStudySection {
  heading: string;
  body: string[];
  /** Optional fenced code sample rendered under the prose. */
  code?: { language: string; content: string };
}

export interface CaseStudy {
  /** One-paragraph answer to "what is this and why does it exist". */
  summary: string;
  sections: CaseStudySection[];
}

export interface Project {
  slug: string;
  name: string;
  /** Short line used in the home-page list. */
  tagline: string;
  /** Primary link (live product / registry page). */
  url: string;
  repo?: string;
  /** npm package name — presence turns on live download stats. */
  npmPackage?: string;
  /** First publish date, used as the start of the downloads chart. */
  npmSince?: string;
  /** GitHub repo name for star counts. */
  githubRepo?: string;
  category: "product" | "package" | "plugin";
  featured: boolean;
  stack: string[];
  accent: BadgeAccent;
  /** Shown when live stats are unavailable. */
  fallbackMilestone: string;
  /** Square icon URL for the products grid. */
  icon?: string;
  caseStudy?: CaseStudy;
}

export const projects: Project[] = [
  {
    slug: "recso",
    name: "Recso",
    tagline: "A screen recorder and video editor for Windows",
    url: "https://recso.dev",
    category: "product",
    featured: true,
    stack: ["TypeScript", "Rust", "React"],
    accent: "green",
    fallbackMilestone: "Custom cursor capture",
    icon: "https://recso.dev/R.png",
    caseStudy: {
      summary:
        "Recso is a desktop screen recorder and video editor for Windows, built on a TypeScript front end with a Rust core for the parts that have to be fast.",
      sections: [
        {
          heading: "Why build another recorder",
          body: [
            "Most free Windows recorders either watermark the output, cap the recording length, or hand you a file you then have to edit somewhere else. Recso keeps capture and editing in one place so a clip can go from recording to trimmed export without leaving the app.",
          ],
        },
        {
          heading: "The Rust core",
          body: [
            "Capture, encoding and the frame pipeline live in Rust; the interface is TypeScript and React. Splitting it this way keeps the UI thread free while frames are being written, which is what makes smooth high-frame-rate capture possible on ordinary hardware.",
          ],
        },
        {
          heading: "Custom cursor rendering",
          body: [
            "The cursor is captured and composited separately from the screen frames rather than being baked into them. That makes it possible to restyle, scale and smooth the pointer after the fact — the detail people notice first in a polished screen recording.",
          ],
        },
      ],
    },
  },
  {
    slug: "kickstart-express",
    name: "Kickstart Express",
    tagline: "A scaffolder CLI to quickly generate an Express app",
    url: "https://kickstart.express",
    repo: "https://github.com/bhaveshsinghal95182/kickstart-express",
    githubRepo: "kickstart-express",
    npmPackage: "kickstart-express",
    npmSince: "2025-07-28",
    category: "package",
    featured: true,
    stack: ["TypeScript", "Node.js", "Inquirer"],
    accent: "red",
    fallbackMilestone: "1k+ weekly downloads",
    caseStudy: {
      summary:
        "A CLI that scaffolds a production-shaped Express.js project in one command — TypeScript or JavaScript, optional Docker, and a structured controllers/services/routes layout — then keeps extending it after the fact with an `add` command.",
      sections: [
        {
          heading: "The problem",
          body: [
            "Every new Express service starts with the same twenty minutes: init the package, wire TypeScript, add CORS and dotenv, decide on a folder layout, write a Dockerfile. It is not hard work, it is just repeated work, and it is easy to do slightly differently every time.",
          ],
        },
        {
          heading: "One command, running server",
          body: [
            "The CLI runs interactively by default and asks five questions — name, language, Docker, src folder, structured architecture. Pass the same answers as flags and it skips the prompts entirely, which is what makes it usable inside other scripts.",
          ],
          code: {
            language: "bash",
            content:
              "npx kickstart-express --name my-api --language ts --docker --src --structured\ncd my-api && pnpm dev",
          },
        },
        {
          heading: "v2: adding features to projects that already exist",
          body: [
            "Scaffolders usually help once and then get in the way. v2 added an `add` command so the tool stays useful past minute one: `add database` wires up MongoDB or Postgres with Mongoose, Prisma or Drizzle, and `add auth` sets up JWT or Clerk. Each works interactively or with flags.",
            "v2 also dropped the `create` subcommand — scaffolding is now the default behaviour — and added graceful Ctrl+C handling that cleans up half-written project directories instead of leaving them behind.",
          ],
          code: {
            language: "bash",
            content:
              "kickstart-express add db --db-type postgres --orm prisma\nkickstart-express add auth --auth-type jwt",
          },
        },
        {
          heading: "What generated projects come with",
          body: [
            "Express with CORS and dotenv configured, hot reload via tsx or nodemon, build and start scripts, and — when asked for — a multi-stage Dockerfile plus docker-compose. The structured template ships a small calculator API as a worked example of the controller/service/route split.",
          ],
        },
      ],
    },
  },
  {
    slug: "company-logos",
    name: "Company Logos",
    tagline:
      "An npm package inspired by shadcn to create logos in all frontend frameworks",
    url: "https://logos-www.vercel.app/",
    repo: "https://github.com/bhaveshsinghal95182/logos",
    githubRepo: "logos",
    npmPackage: "company-logos",
    npmSince: "2025-08-21",
    category: "package",
    featured: true,
    stack: ["TypeScript", "Node.js", "React"],
    accent: "blue",
    fallbackMilestone: "500+ weekly downloads",
    caseStudy: {
      summary:
        "A CLI that copies company logo components straight into a React project — shadcn's model applied to brand SVGs, so the logos become your code instead of another dependency.",
      sections: [
        {
          heading: "Copy, don't install",
          body: [
            "Icon packages make you ship the whole set to use three glyphs, and you cannot edit what you pulled in. Following shadcn's approach, `company-logos` writes the component file into your project. From then on it is ordinary source you can restyle, resize or delete.",
          ],
          code: {
            language: "bash",
            content:
              "npx company-logos add vercel next github --tsx\nnpx company-logos add --all --jsx",
          },
        },
        {
          heading: "TypeScript or JavaScript, your call",
          body: [
            "`--tsx` and `--jsx` decide what gets written, so the same command works in a typed Next.js app and a plain Vite one. `--force` overwrites, `--all` takes everything.",
          ],
        },
        {
          heading: "Keeping track of what was added",
          body: [
            "Added components are recorded in a `logos.json` manifest at the project root, so `company-logos list` can tell you what is already installed and `available` can show what is not. Components are fetched from GitHub at add time, which keeps the published package small.",
          ],
        },
      ],
    },
  },
  {
    slug: "messy-ui",
    name: "Messy UI",
    tagline: "A registry of animated React components built with GSAP and Motion",
    url: "https://messyui.dev",
    repo: "https://github.com/bhaveshsinghal95182/messy-ui",
    githubRepo: "messy-ui",
    category: "product",
    featured: true,
    stack: ["Next.js", "GSAP", "Framer Motion"],
    accent: "purple",
    fallbackMilestone: "shadcn-compatible registry",
    icon: "https://messyui.dev/favicon_io/android-chrome-192x192.png",
    caseStudy: {
      summary:
        "A growing collection of animated React components, distributed through the shadcn CLI. It started as a place to keep the creative-programming pieces that would otherwise be lost in one-off projects.",
      sections: [
        {
          heading: "The hard part was the preview, not the components",
          body: [
            "The library sat unbuilt for about half a year because of one unsolved problem: a single preview surface that could host two very different kinds of component. Inline ones are atomic and self-contained. Sandboxed ones only make sense inside a full page-like environment, dependent on their surroundings and position.",
            "Solving that split is what finally made the registry possible.",
          ],
        },
        {
          heading: "Installable with one command",
          body: [
            "Every component is published as a shadcn registry entry, so adding one is the same command you already use for shadcn/ui — no new tooling to learn, and the code lands in your project rather than in node_modules.",
          ],
          code: {
            language: "bash",
            content:
              "npx shadcn@latest add https://messyui.dev/r/animated-counter.json\nnpx shadcn@latest add https://messyui.dev/r/hold-button.json",
          },
        },
        {
          heading: "On the AI in it",
          body: [
            "The repo says it plainly: parts of this library are AI-generated, and it is being actively reclaimed by hand. Without that starting push the project would not exist at all — half a year of not shipping is its own kind of answer.",
          ],
        },
      ],
    },
  },
  {
    slug: "tweakcn-figma-plugin",
    name: "tweakcn CSS Import",
    tagline: "A Figma plugin to create a colour palette from tweakcn themes",
    url: "https://www.figma.com/community/plugin/1533799530090421982/tweakcn-css-import",
    repo: "https://github.com/bhaveshsinghal95182/tweakcn-figma-import",
    githubRepo: "tweakcn-figma-import",
    category: "plugin",
    featured: true,
    stack: ["TypeScript", "Figma Plugin API"],
    accent: "purple",
    fallbackMilestone: "182 users",
    caseStudy: {
      summary:
        "A Figma community plugin that takes the CSS variables a tweakcn theme produces and turns them into a usable colour palette inside Figma.",
      sections: [
        {
          heading: "Closing the loop between code and design",
          body: [
            "tweakcn is a visual theme editor for shadcn/ui — it hands you a block of CSS custom properties. Getting those same colours into Figma meant copying hex values one at a time, which is exactly the kind of transcription that goes wrong quietly.",
            "The plugin parses the CSS and generates the palette in Figma, so the design file and the codebase start from identical values.",
          ],
        },
        {
          heading: "Built on the Figma plugin API",
          body: [
            "Written in TypeScript against @figma/plugin-typings and published to the Figma Community, where it is currently used by 182 people.",
          ],
        },
      ],
    },
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function projectUrl(project: Project): string {
  return `${site.url}/projects/${project.slug}`;
}

/** Packages with live npm stats, in the order they appear on /projects. */
export const npmProjects = projects.filter(
  (project): project is Project & { npmPackage: string; npmSince: string } =>
    Boolean(project.npmPackage && project.npmSince),
);
