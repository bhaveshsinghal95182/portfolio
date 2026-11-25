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
  /** Primary link (live product / registry page / source). */
  url?: string;
  /** Label for the primary link, e.g. "Source" when there is no live site. */
  urlLabel?: string;
  repo?: string;
  /** Last meaningful change, used by the sitemap. ISO date. */
  updated?: string;
  /** npm package name — presence turns on live download stats. */
  npmPackage?: string;
  /** First publish date, used as the start of the downloads chart. */
  npmSince?: string;
  /** GitHub repo name for star counts. */
  githubRepo?: string;
  /** schema.org type for the case-study JSON-LD. */
  schemaType?: "SoftwareApplication" | "SoftwareSourceCode";
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
    tagline: "A screen recorder and editor with a native Rust engine",
    url: "https://recso.dev",
    category: "product",
    featured: true,
    stack: ["Electron", "React", "TypeScript", "Rust"],
    accent: "green",
    fallbackMilestone: "Native GPU engine",
    updated: "2026-11-24",
    icon: "https://recso.dev/R.png",
    caseStudy: {
      summary:
        "Recso is a desktop screen recorder and editor. It records the screen or a window, the webcam, microphone, system audio and cursor, then edits zooms, cursor effects, backgrounds and cuts in one place. The capture and render engine is Rust; the interface is React inside Electron.",
      sections: [
        {
          heading: "Why build another recorder",
          body: [
            "Free Windows recorders watermark the output, cap the recording length, or hand you a file you then have to edit somewhere else. Recso keeps recording and editing in one app, so a clip goes from capture to trimmed export without a second program.",
          ],
        },
        {
          heading: "The Rust core",
          body: [
            "Screen capture, audio, the webcam and the cursor run through a Rust engine called velocity. On Windows it uses Windows Graphics Capture and WASAPI; the Linux port replaces those with xdg-desktop-portal, PipeWire and V4L2. Cursor position and shape are recorded as their own track, which is what lets the editor restyle, scale and smooth the pointer after the fact.",
            "Recording and export encode with NVENC when an NVIDIA GPU is present, and with openh264 on Linux otherwise. A 1080p60 PipeWire test wrote 171 frames in 2.79 seconds.",
          ],
        },
        {
          heading: "One render chain for preview and export",
          body: [
            "The effects run before preview and export split. One GPU render chain composites the background, zoom, cursor and webcam, then either imports the frame into Electron as a shared texture for preview or writes it straight to an encoder. A filter cannot look one way on screen and another in the file, because both read from the same implementation.",
            "On Windows that chain is D3D11 with Media Foundation. On Linux it is wgpu, with the shaders ported to WGSL. Frames travel as DMA-BUFs and reach the editor without a trip through JavaScript.",
          ],
        },
        {
          heading: "Crash-safe by default",
          body: [
            "Recording metadata is written to a local SQLite database as it goes, so a crash does not lose the take: the project can be recovered and opened in the editor. Finished projects keep their cuts, zooms and effects as data, which is also what lets the app re-export at a different preset later.",
          ],
        },
        {
          heading: "Automation, off by default",
          body: [
            "An optional local API exposes recording and export over a Unix socket, a CLI and an MCP server. It is off until it is switched on in Settings, a recording started over the API is visible in the UI, and nothing in it deletes files. Slatey uses it to point Recso at one folder per video.",
          ],
        },
      ],
    },
  },
  {
    slug: "slatey",
    name: "Slatey",
    tagline: "A Linux app that keeps every video project in one folder",
    url: "https://github.com/bhaveshsinghal95182/slatey",
    urlLabel: "Source",
    githubRepo: "slatey",
    category: "product",
    featured: true,
    stack: ["Python", "GTK 4", "libadwaita", "ffmpeg"],
    accent: "blue",
    fallbackMilestone: "Linux desktop app",
    updated: "2026-10-13",
    caseStudy: {
      summary:
        "Slatey is a GTK 4 / libadwaita app for Linux that gives every video its own folder and opens OBS, Audacity, Recso and DaVinci Resolve already pointed at it. It also cuts the pauses out of a recording and polishes the voiceover with ffmpeg.",
      sections: [
        {
          heading: "One folder per video",
          body: [
            "Video work spreads itself across applications. OBS writes to its own recording path, Audacity exports wherever it last exported, Resolve keeps a Media Storage list, and the files you actually need end up in four places. Starting the next video means finding all of them again.",
            "Slatey makes one folder the unit of work. Everything for a video lives under `~/Videos/Projects/<Video>/`: `Media/` for anything that gets edited, with `Footage/`, `Voiceover/Raw/`, `Music/` and `Images/` inside it, plus separate `Recso/`, `Audacity/` and `Renders/` folders. Resolve imports one folder and the rest stays out of the way.",
          ],
        },
        {
          heading: "Opening tools in the right place",
          body: [
            "The useful part is not launching the app, it is launching it with its settings already moved. OBS gets its record directory switched either through its profile config or over obs-websocket when it is already running. Audacity gets its save and export directories rewritten. Recso is pointed at the project through its Automation API, a Unix socket it forgets on quit, so the paths are set again each time.",
            "Resolve is the awkward one. The free Linux build cannot be scripted from outside, and its menu scripts run in a sandbox without file access. So Slatey prepares Resolve's Media Storage and recent-project settings while Resolve is closed, and then shows the import steps rather than pretending it can click them.",
          ],
        },
        {
          heading: "Cutting pauses without losing sync",
          body: [
            "Cut pauses runs ffmpeg's `silencedetect`, snaps every cut point to a video frame boundary, and removes the frames and the matching audio in a single pass. That is why the audio stays in sync no matter how many cuts there are, which is the part a naive concatenate gets wrong.",
            "Audio is written as FLAC, because the free Linux build of Resolve cannot read AAC. AV1 sources are re-encoded with NVENC when an NVIDIA GPU is present and SVT-AV1 otherwise; H.264 and HEVC go through NVENC or x264.",
          ],
        },
        {
          heading: "Voiceover polish",
          body: [
            "Polish voiceover reads the raw takes from `Media/Voiceover/Raw/` and writes a de-essed, loudness-levelled mono 48 kHz, 24-bit WAV to `Media/Voiceover/`. The default target is −16 LUFS with a −1.5 dB true-peak ceiling, and Gentle/Strong settings cover consonants that lose clarity or takes that still hiss.",
          ],
        },
      ],
    },
  },
  {
    slug: "aisprite",
    name: "aisprite",
    tagline: "An AI-assisted pixel art editor, in the spirit of Aseprite",
    url: "https://aisprite.vercel.app",
    repo: "https://github.com/bhaveshsinghal95182/aisprite",
    githubRepo: "aisprite",
    category: "product",
    featured: true,
    stack: ["Next.js", "TypeScript", "Gemini", "MCP"],
    accent: "blue",
    fallbackMilestone: "AI + MCP editor",
    updated: "2026-10-17",
    icon: "/projects/aisprite.png",
    caseStudy: {
      summary:
        "aisprite is a pixel art editor where the drawing tools and the AI agent speak the same language. Every edit is a list of ops, the agent gets those ops as its only tools, and it sees a rendered PNG after each draw so it can critique and fix its own work. The same editor is also served to Claude and other MCP clients.",
      sections: [
        {
          heading: "Ops are the drawing language",
          body: [
            "Every action in the editor — pencil, fill, rectangle, layer, palette, frame — becomes a list of ops. The document model is pure TypeScript with no React or DOM, documents are immutable, and layers that do not change are shared between versions, which keeps undo history cheap.",
            "The zod schema that validates a tool call is also the tool definition the model sees. Applied ops stream back to the browser as NDJSON, so a run appears as it is drawn and the whole AI run is a single undo step.",
          ],
        },
        {
          heading: "The model has to see what it drew",
          body: [
            "A drawing tool is a blindfold for a text model unless it can look. `draw` returns a rendered PNG of the sprite; `view` returns one layer as an image plus a character grid for exact coordinates. The agent draws, looks, and fixes. The editor's own AI panel and an MCP client both use that loop.",
          ],
        },
        {
          heading: "Local and hosted MCP",
          body: [
            "`pnpm mcp` runs the editor as a stdio MCP server with no model inside it: the calling agent is the artist. The hosted version serves the same tools over HTTP, stores sprites in Upstash Redis, and can be added to claude.ai as a connector. Local sprites are files with live two-way sync; if both sides change at once, the file wins.",
          ],
        },
        {
          heading: "The editor is not a demo",
          body: [
            "Frames, layers, onion skin, mirror brushes, palette editing, pixel-perfect zoom, animation playback, and export to PNG, animated GIF, a sprite sheet or a ZIP of layers. The AI panel is an addition to an editor that works without a key.",
          ],
        },
      ],
    },
  },
  {
    slug: "kickstart-express",
    name: "Kickstart Express",
    tagline: "A scaffolder CLI to quickly generate an Express app",
    repo: "https://github.com/bhaveshsinghal95182/kickstart-express",
    githubRepo: "kickstart-express",
    npmPackage: "kickstart-express",
    npmSince: "2025-07-28",
    category: "package",
    featured: true,
    stack: ["TypeScript", "Node.js", "Inquirer"],
    accent: "red",
    fallbackMilestone: "1k+ weekly downloads",
    updated: "2025-12-12",
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
    updated: "2025-12-12",
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
    updated: "2026-10-16",
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
    featured: false,
    stack: ["TypeScript", "Figma Plugin API"],
    accent: "purple",
    fallbackMilestone: "182 users",
    updated: "2025-08-21",
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
  {
    slug: "vim-interactive-tutor",
    name: "Vim Interactive Tutor",
    tagline: "A browser-based vimtutor with 24 lessons and real Vim emulation",
    url: "https://vim-interactive-tutor.vercel.app",
    repo: "https://github.com/bhaveshsinghal95182/vim-interactive-tutor",
    githubRepo: "vim-interactive-tutor",
    category: "product",
    featured: false,
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS"],
    accent: "green",
    fallbackMilestone: "24 lessons",
    updated: "2025-12-27",
    caseStudy: {
      summary:
        "Vim Interactive Tutor recreates the vimtutor experience in the browser: 24 lessons across seven levels, each with a task, a visible target and automatic completion detection, running against an emulated Vim rather than a text box with instructions beside it.",
      sections: [
        {
          heading: "Learning Vim by doing it",
          body: [
            "Reading about `ciw` does not teach `ciw`. Every lesson gives you a buffer with a specific starting state and a task — delete this word, change what is inside the quotes, move three words and replace one — and checks the resulting text and cursor position rather than counting keystrokes.",
            "Lessons unlock progressively, and progress is saved in local storage, so a session can be stopped and resumed without an account or a backend.",
          ],
        },
        {
          heading: "Emulating Vim, not approximating it",
          body: [
            "The editor implements Normal, Insert, Visual, Visual-Line, Command and Replace modes, with counts, motions and operators that compose the way Vim's do: `3w`, `d2j`, `ci(`, and command chains after `:`. The virtual shell answers `:w`, `:!ls`, `:!pwd`, `:!date`, `:set` and `:help` so the lesson about saving and quitting does not dead-end.",
            "That composition is the part that usually gets skipped. A tutorial that only supports the exact keys in each lesson falls apart the moment someone tries something one character different.",
          ],
        },
        {
          heading: "No backend",
          body: [
            "The whole thing is a Vite build — React 19, TypeScript, Tailwind and shadcn/ui components — deployed as static files. There is no server to keep alive and nothing to sign up for before the first lesson.",
          ],
        },
      ],
    },
  },
  {
    slug: "media-stack",
    name: "Media Stack",
    tagline: "A self-hosted film and TV stack that rejects releases without English subtitles",
    url: "https://github.com/bhaveshsinghal95182/media-stack",
    urlLabel: "Source",
    githubRepo: "media-stack",
    schemaType: "SoftwareSourceCode",
    category: "product",
    featured: false,
    stack: ["Python", "FastAPI", "Docker", "Jellyfin", "Kotlin"],
    accent: "purple",
    fallbackMilestone: "Self-hosted on one laptop",
    updated: "2026-11-16",
    caseStudy: {
      summary:
        "One laptop, seven services, no subscriptions: Seerr takes the request, Radarr and Sonarr find a release, Prowlarr hands them indexers, qBittorrent downloads it and Jellyfin plays it. A gate called subgate sits in the download path, and a FastAPI page called library covers the jobs the Arr interfaces do not.",
      sections: [
        {
          heading: "The pipeline",
          body: [
            "Requests go into Seerr, which talks to Radarr for films and Sonarr for shows. Both search through Prowlarr and hand the chosen release to qBittorrent; finished downloads are imported back into the library and served by Jellyfin. Bazarr fills in subtitles, Recyclarr keeps quality profiles current, and FlareSolverr gets Prowlarr past Cloudflare.",
            "The Arrs and qBittorrent bind to `127.0.0.1`; only Jellyfin, Seerr and the library page are reachable from the LAN. Everything runs in Docker on the same machine, which is the whole point — the alternative was four subscriptions.",
          ],
        },
        {
          heading: "subgate: reject before the download runs",
          body: [
            "A release with no English subtitles and no English audio is worthless here, and finding that out after a 20 GB download wastes an evening. subgate watches the Radarr and Sonarr queues and checks the torrent before it commits.",
            "If the file list contains an English subtitle file, it passes immediately. Otherwise subgate downloads only the largest non-sample video, sequentially, with first and last piece priority, until the first 4 MiB are on disk, then asks `ffprobe` what tracks exist. English subtitle or audio passes; a Hindi audio track passes for films; neither means the queue entry is removed with `blocklist=true`, and the Arr searches the next release on its own.",
            "Timeouts are measured in active download time, so a torrent queued overnight is not rejected for being slow. A release that never becomes readable is rejected as an unreadable header after 16 MiB.",
          ],
        },
        {
          heading: "library: the page the Arr interfaces do not have",
          body: [
            "The Arr UIs are built for managing indexers and quality profiles, not for browsing what is actually on disk. The library page is FastAPI, Jinja and htmx in one container: a season-by-season view of the files, search and add, a watchlist, following for airing anime, an import tab with a rescue path for failed imports, and cleanup for leftover torrents and orphaned files.",
            "It also has playlists that survive a re-import and a per-show TV toggle that hides a title from the TV's Jellyfin user without touching anyone else's library. It is password-protected and lives on the LAN, which is the right amount of auth for something one household uses.",
          ],
        },
        {
          heading: "The TV end",
          body: [
            "The library also runs as a Fire TV app: one WebView that finds the server by scanning the LAN, takes its basic-auth credentials from the install script, and injects the gruvbox palette at 1.5× so the rows read from the sofa.",
          ],
        },
      ],
    },
  },
  {
    slug: "dukanbook",
    name: "DukanBook",
    tagline: "A day-by-day cash book for a small sweet shop",
    category: "product",
    featured: false,
    stack: ["Next.js", "React", "PostgreSQL", "Neon"],
    accent: "green",
    fallbackMilestone: "Private app, used daily",
    updated: "2026-11-16",
    caseStudy: {
      summary:
        "DukanBook replaces a paper cash book for a halwai business. One sheet per business day records the closing drawer count, two cash-in-hand piles and the day's expenses. Sales are never typed in; they are what the cash movement proves.",
      sections: [
        {
          heading: "Sales come out of the cash",
          body: [
            "CIH3 is the total cash in hand and is always the sum of the two piles: `CIH3 = CIH1 + CIH2`. A day's sales are `CIH3 − the previous CIH3 + expenses`. A first day has no previous day, so it is measured against the starting cash in Settings and the float already in the shop is not counted as that day's sales.",
            "The closing drawer is the counted figure. The notes and coins left in it are the float that carries into the next day, so there is no opening drawer to enter.",
          ],
        },
        {
          heading: "Money as integers",
          body: [
            "Postgres stores money as `numeric(14,2)`; TypeScript works in integer paise. The accounting functions are pure, take no React or database handle, and have their own unit tests. Saving a day runs in one transaction and writes an audit row. Expenses are voided rather than deleted, so the original amount stays visible.",
          ],
        },
        {
          heading: "Small on purpose",
          body: [
            "One shop, one PIN, one book. There is no ORM: versioned SQL migrations and a small runner. Neon's pooled URL is used by the app and the direct URL by migrations, because PgBouncer's transaction mode breaks session-level work.",
            "Reports are one month at a time, with a CSV export, a settings lock and an audit trail. The negative-sales case has its own notes in the accounting module instead of being clamped to zero.",
          ],
        },
      ],
    },
  },
  {
    slug: "dealforge",
    name: "DealForge",
    tagline: "A deal pipeline that tags affiliate links and posts to Telegram and a live site",
    url: "https://dealforge-rust.vercel.app",
    repo: "https://github.com/bhaveshsinghal95182/dealforge",
    githubRepo: "dealforge",
    category: "product",
    featured: false,
    stack: ["Python", "Next.js", "PostgreSQL", "Neon"],
    accent: "red",
    fallbackMilestone: "Live deal site",
    updated: "2026-11-24",
    icon: "/projects/dealforge.png",
    caseStudy: {
      summary:
        "DealForge is built to pull deals from Amazon and Flipkart, wrap Ajio links in an affiliate tracker, and post them to a Telegram channel and a live site. The affiliate APIs are gated, so the first version works from a manual queue and switches the automatic pullers on when the accounts are approved.",
      sections: [
        {
          heading: "The gates are part of the design",
          body: [
            "Amazon's Creators API needs 10 qualifying sales in the past 30 days before it hands over product data, and Flipkart needs an approved affiliate account. Ajio's network gives a click tracker rather than a product feed, so a link can be wrapped but the price still comes from the post.",
            "That makes the manual queue a real path, not a placeholder: paste a deal, the link gets tagged, and the same filters, dedupe and price history run. When access opens, `enabled = true` turns the pullers on.",
          ],
        },
        {
          heading: "A 48-hour window",
          body: [
            "The laptop pushes the last 48 hours of deals to `POST /api/deals`, and the site replaces the whole window in one transaction. Every row carries `expires_at`, so if the laptop stops pushing the site empties itself instead of serving stale prices. An empty push is rejected unless the body explicitly allows it.",
          ],
        },
        {
          heading: "Two clients, one feed",
          body: [
            "Telegram came first, including multi-product digests from private channels. The site is Next.js and Postgres on Neon: it revalidates every minute, and a push revalidates the deal routes immediately. Images go through `next/image` with a week-long CDN cache.",
          ],
        },
      ],
    },
  },
  {
    slug: "headcount",
    name: "Headcount",
    tagline: "A crowd-runner game for Android, with its art and music generated in code",
    url: "https://combustor-studio.vercel.app/work/headcount",
    urlLabel: "Studio",
    repo: "https://github.com/bhaveshsinghal95182/headcount",
    githubRepo: "headcount",
    category: "product",
    featured: false,
    stack: ["Kotlin", "Jetpack Compose", "Filament", "Play Billing"],
    accent: "purple",
    fallbackMilestone: "Android, closed test",
    updated: "2026-10-26",
    icon: "/projects/headcount.png",
    caseStudy: {
      summary:
        "Headcount is a casual Android game: steer a crowd through multiply and divide gates, grow it into an army, and fight a wave every thirty seconds. All of the art and audio are generated in code, and the rules live in a pure Kotlin module so they can be tested without a phone.",
      sections: [
        {
          heading: "The crowd is the weapon",
          body: [
            "Every gate multiplies or divides the crowd. Power is crowd × strength, and a fight costs people equal to the enemy power divided by your strength. The first boss, at wave 5, is 1.7× the wave's power.",
            "Those numbers are not guesses. A headless bot plays 200 seeded runs per profile, and the medians — wave 5 on a fresh save, wave 10 after a week of upgrades, wave 25 maxed — are what set the curve.",
          ],
        },
        {
          heading: "Rules without Android",
          body: [
            "The core module is plain Kotlin: gates, perks, leaders, economy, missions and the save codec. It runs on the JVM, so the balance simulation and unit tests do not need an emulator. A run is planned one segment at a time from a seed and the crowd at that moment, which is also what makes the daily track reproducible.",
          ],
        },
        {
          heading: "Art and audio from code",
          body: [
            "Sprites are drawn into atlases at two sizes and the crowd, gates and scenery render in Compose and Filament. Music is deterministic mono PCM at 22,050 Hz and 128 BPM, with 16 synthesised effects. No downloaded images or audio means no licence to chase for the store build.",
          ],
        },
        {
          heading: "Built for the store",
          body: [
            "The release is a signed AAB with Play Billing for a one-time No Ads Pack, AdMob rewarded ads, a privacy policy on the studio site, and a store listing with screenshots and a feature graphic. It is in closed testing on Google Play.",
          ],
        },
      ],
    },
  },
  {
    slug: "razorrecon",
    name: "razorrecon",
    tagline: "Settlement reconciliation for Razorpay merchants",
    repo: "https://github.com/bhaveshsinghal95182/razorrecon",
    githubRepo: "razorrecon",
    category: "product",
    featured: false,
    stack: ["Rust", "CLI", "Simulation"],
    accent: "purple",
    fallbackMilestone: "88.7% matched, 0 wrong",
    updated: "2026-09-04",
    caseStudy: {
      summary:
        "razorrecon matches Razorpay settlements to bank credits. It walks the whole chain, from order to payment to settlement to the credit in the bank, and names every fee, GST deduction, refund and chargeback on the way. A match rate only means something next to the number of wrong matches, so it reports both.",
      sections: [
        {
          heading: "Two halves of the chain",
          body: [
            "Most reconciliation tools match settlements to bank credits and stop there. That says money arrived; it does not say the amount was right. The first half checks payments against settlements after fees, GST, refunds, chargebacks and adjustments. The second half checks the settlement against the bank credit, where references are cut short, value dates move, and a credit can arrive split, duplicated or reversed.",
          ],
        },
        {
          heading: "The answers are sealed by the compiler",
          body: [
            "The simulator holds the ground truth in `recon-sim`; the matching engine only depends on `recon-core`, so it cannot even name the type that holds the answers. That is why zero wrong matches is something you can check: the engine has no route to the truth.",
          ],
        },
        {
          heading: "An explanation has to add up",
          body: [
            "`Resolution` has private fields and one constructor. `Resolution::close` returns an error when the parts do not add up to the difference in exact paise, so a shaky explanation cannot be saved. Every amount is whole paise. GST on a fee lands on fractions, and floating point would turn those crumbs into gaps that were never there.",
          ],
        },
        {
          heading: "Three answers, one sorted list",
          body: [
            "MATCHED means traced end to end. AWAITING means the settlement is inside its SLA and the credit is not due yet. EXCEPTION means it is still open, with the possible causes listed. Exceptions are sorted by money at risk.",
            "Over 90 days, the spreadsheet lookup matched 62.0% and got 8 wrong. razorrecon matched 88.7% with 0 wrong, and left 31 exceptions instead of 126. The ceiling on that data is 98.4%, because 27 of the 274 units cannot be closed by anyone.",
          ],
        },
      ],
    },
  },
  {
    slug: "recoup",
    name: "recoup",
    tagline: "Failed-payment recovery for Razorpay",
    repo: "https://github.com/bhaveshsinghal95182/recoup",
    githubRepo: "recoup",
    category: "product",
    featured: false,
    stack: ["Rust", "CLI", "Simulation"],
    accent: "green",
    fallbackMilestone: "41.4% recovered",
    updated: "2026-09-05",
    caseStudy: {
      summary:
        "recoup decides what to do after a Razorpay payment fails. It treats the failure code as a distribution over causes, scores nine recovery actions by expected value, and only spends a model on the 16% of failures a lookup cannot explain.",
      sections: [
        {
          heading: "The code is not the cause",
          body: [
            "`card_declined` from `issuer_bank` can come from seven different causes, and each one wants a different recovery. Retrying three times is the usual answer. The tuple Razorpay actually reports — method, reason, code, source, step — resolves 76% of card failures to one cause with no inference. 81.8% of all decisions come from that lookup.",
          ],
        },
        {
          heading: "A distribution, not a label",
          body: [
            "For the rest, diagnosis returns probabilities. Every action is scored as expected value: the probability of each cause, the chance that action succeeds for that cause at that time, the amount, the chance the customer is still there after the wait, minus the cost. Carrying the whole distribution means the agent often does not need to know the cause; asking for a new card is a decent move under several of them.",
          ],
        },
        {
          heading: "Nothing is keyed to a constant",
          body: [
            "\"Retry in three days\" appears nowhere. Timing comes from when that customer's own charges landed, and about 18% have no pattern at all. An outage detector found 4 of 4 outages, with a mean time of 39 minutes and no false alarms over 14 days.",
          ],
        },
        {
          heading: "The result",
          body: [
            "On the committed 14-day world: 788,378 attempts, 44,863 failures, Rs 15,00,21,139 at risk. The retry-3x baseline recovered 27.9%; recoup recovered 41.4%, net of contact costs and discounts. The physical ceiling is 46.7% and an oracle with perfect diagnosis reaches 43.4%, so the headroom left in diagnosis is 2.0 points.",
          ],
        },
      ],
    },
  },
  {
    slug: "sutra",
    name: "Sutra",
    tagline: "A local-first note app on Tauri, in the spirit of Obsidian",
    repo: "https://github.com/bhaveshsinghal95182/sutra",
    githubRepo: "sutra",
    category: "product",
    featured: false,
    stack: ["Tauri", "React", "TypeScript", "Rust", "CodeMirror"],
    accent: "blue",
    fallbackMilestone: "Local-first desktop app",
    updated: "2026-03-20",
    caseStudy: {
      summary:
        "Sutra is a desktop note app. Pick a vault folder, edit Markdown in CodeMirror with Vim bindings, and see the links between notes as a force graph. Tauri supplies the window and the filesystem; there is no server and no account.",
      sections: [
        {
          heading: "The vault is the database",
          body: [
            "The app opens on a vault picker. Everything after that is files: `tauri-plugin-fs` reads, writes and watches the folder, and a Zustand store keeps the open folder, file and tabs. Nothing leaves the machine.",
          ],
        },
        {
          heading: "An editor, not a text area",
          body: [
            "CodeMirror 6 handles Markdown, with KaTeX for maths, a Vim mode for people who want it, and language data for code blocks. The editor is the reason the app exists; the shell around it stays out of the way.",
          ],
        },
        {
          heading: "The graph",
          body: [
            "Notes become nodes and their links become edges in a D3 force graph. It opens as a tab beside the editor, so the shape of the vault is one click away from the file you are writing.",
          ],
        },
        {
          heading: "Why Tauri",
          body: [
            "Tauri uses the system webview instead of shipping Chromium, and the Rust side owns the filesystem and graph commands. The front end is React 19 and Vite. The app is at 0.1.0 and still growing.",
          ],
        },
      ],
    },
  },
  {
    slug: "video-share",
    name: "VideoShare",
    tagline: "A secure video sharing platform for client review",
    repo: "https://github.com/bhaveshsinghal95182/video-share",
    githubRepo: "video-share",
    category: "product",
    featured: false,
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Clerk", "Google Cloud"],
    accent: "purple",
    fallbackMilestone: "Client-ready sharing",
    updated: "2025-08-16",
    caseStudy: {
      summary:
        "VideoShare sends a video to a client without handing over the file. Uploads land in Google Cloud Storage, playback streams through the app, and a share link carries an expiry, a view limit and a watermark.",
      sections: [
        {
          heading: "The object URL never leaves the server",
          body: [
            "Videos are stored in Google Cloud Storage, but the client never gets a signed object URL. Playback goes through a Next.js route that streams the object, so access is checked on every request.",
          ],
        },
        {
          heading: "Watermarks and view limits",
          body: [
            "Each share can carry a text watermark with its own position and opacity, a time limit and a maximum number of views. Downloads are blocked in several layers, including the keyboard shortcuts people reach for first.",
          ],
        },
        {
          heading: "The model",
          body: [
            "Clerk handles accounts. Postgres with Drizzle stores users, video metadata and `video_access` rows, and storage usage is tracked per user. The app is Next.js 15, TypeScript, Tailwind and Radix.",
          ],
        },
      ],
    },
  },
  {
    slug: "code-execution-platform",
    name: "Code Execution Platform",
    tagline: "A sandboxed runner for JavaScript, Python, C++ and Java",
    repo: "https://github.com/bhaveshsinghal95182/code-execution-backend",
    githubRepo: "code-execution-backend",
    category: "product",
    featured: false,
    stack: ["Next.js", "Express", "TypeScript", "Docker", "Linux"],
    accent: "red",
    fallbackMilestone: "50+ concurrent runs",
    updated: "2025-08-03",
    caseStudy: {
      summary:
        "A web editor that runs code in four languages on a Linux host. Every run gets its own user and its own limits, and the Express backend sits behind Nginx with TLS.",
      sections: [
        {
          heading: "A user per run",
          body: [
            "Each request creates a unique `exec_${uuid}` Linux user. Nothing is shared between executions, and the user is removed afterwards. The isolation is the operating system's, not a JavaScript sandbox.",
          ],
        },
        {
          heading: "Limits that kill the process group",
          body: [
            "Runs get 10 seconds of CPU, 40 processes and a memory ceiling through ulimit. The runner starts each execution in its own process group, sends SIGTERM at the limit, and cleans up orphans so a runaway program cannot leave anything behind.",
          ],
        },
        {
          heading: "Fifty at a time",
          body: [
            "A semaphore caps concurrency, and a single Linux VPS handled 50+ concurrent runs. The backend is Express and TypeScript, the editor is Monaco, Docker Compose runs the stack, and Nginx terminates TLS in front of it.",
          ],
        },
      ],
    },
  },
  {
    slug: "auto-cide",
    name: "Auto-CIDE",
    tagline: "A collaborative IDE in the browser",
    repo: "https://github.com/bhaveshsinghal95182/Auto-CIDE",
    githubRepo: "Auto-CIDE",
    category: "product",
    featured: false,
    stack: ["Node.js", "Socket.IO", "MongoDB", "Docker", "Monaco"],
    accent: "blue",
    fallbackMilestone: "Real-time collaboration",
    updated: "2025-05-05",
    caseStudy: {
      summary:
        "Auto-CIDE puts Monaco in a browser tab, syncs edits between people over Socket.IO, and runs a frontend, a backend and MongoDB from one Docker Compose file. Code runs in a WebContainer, not on the server.",
      sections: [
        {
          heading: "Two people, one buffer",
          body: [
            "Edits travel over Socket.IO, so every connected client sees the same buffer. Monaco supplies the editor, syntax highlighting and IntelliSense.",
          ],
        },
        {
          heading: "Run it without a server",
          body: [
            "WebContainer executes the project in the browser. The backend does not spawn a sandbox for user code, which keeps the deployment to the app, the API and the database.",
          ],
        },
        {
          heading: "Sessions and one command",
          body: [
            "JWT handles sessions and Redis is optional for caching. `docker compose up` starts the frontend, backend and MongoDB together, and the AI endpoint behind the editor answers suggestions and questions.",
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

/** Packages with live npm stats, in the order they appear on /projects. */
export const npmProjects = projects.filter(
  (project): project is Project & { npmPackage: string; npmSince: string } =>
    Boolean(project.npmPackage && project.npmSince),
);
