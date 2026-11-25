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
        "Recso is a desktop screen recorder and editor that I built to capture the screen or a window, the webcam, microphone, system audio and cursor, then edit zooms, cursor effects, backgrounds and cuts in one place. The capture and render engine is Rust, and the interface is React inside Electron, a split that keeps frame work away from the UI thread.",
      sections: [
        {
          heading: "Why build another recorder",
          body: [
            "I built Recso because free Windows recorders watermark the output, cap the recording length, or hand you a file that still needs editing somewhere else. I wanted both steps in one app, so a clip goes from capture to trimmed export without a second program.",
          ],
        },
        {
          heading: "The Rust core",
          body: [
            "I kept screen capture, audio, the webcam and the cursor in a Rust engine called velocity, which uses Windows Graphics Capture and WASAPI on Windows. When I ported it to Linux, I replaced those with xdg-desktop-portal, PipeWire and V4L2 but kept the same JavaScript API, so the rest of the app didn't need a second implementation. I stored cursor position and shape as their own track, which lets the editor restyle, scale and smooth the pointer after the fact.",
            "Linux cursor capture gave me a bug to fix: Hyprland paints a software cursor into the frame on machines with more than one GPU, so a recording briefly showed two pointers. I turned hardware cursors off for the length of a recording and restored the setting at stop.",
            "Recording and export encode with NVENC when an NVIDIA GPU is present and fall back to openh264 on Linux. A 1080p60 PipeWire test wrote 171 frames in 2.79 seconds.",
          ],
        },
        {
          heading: "One render chain for preview and export",
          body: [
            "I made the effects run before preview and export split. One GPU render chain composites the background, zoom, cursor and webcam. It either imports the frame into Electron as a shared texture for preview or writes it straight to an encoder, so a filter can't look one way on screen and another in the file.",
            "On Windows I used D3D11 with Media Foundation. On Linux I used wgpu and ported the shaders to WGSL. Frames travel as DMA-BUFs and reach the editor without a trip through JavaScript.",
          ],
        },
        {
          heading: "Crash-safe by default",
          body: [
            "I write recording metadata into a local SQLite database as the recording runs, so a crash doesn't lose the take. I can recover the project and open it in the editor. Finished projects keep their cuts, zooms and effects as data, which also lets the app re-export at a different preset later.",
          ],
        },
        {
          heading: "Automation, off by default",
          body: [
            "I added an optional local API that exposes recording and export over a Unix socket, a CLI and an MCP server. It stays off until it is enabled in Settings, a recording started over the API shows up in the UI, and nothing in it deletes files. Slatey uses it to point Recso at one folder per video.",
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
        "I built Slatey as a GTK 4 / libadwaita app for Linux that gives every video its own folder and opens OBS, Audacity, Recso and DaVinci Resolve already pointed at it. It also cuts the pauses out of a recording and polishes the voiceover with ffmpeg.",
      sections: [
        {
          heading: "One folder per video",
          body: [
            "I got tired of video work spreading across applications. OBS writes to its own recording path, Audacity exports wherever it last exported, Resolve keeps a Media Storage list, and the files you need end up in four places. Starting the next video means finding all of them again.",
            "I made one folder the unit of work. Everything for a video lives under `~/Videos/Projects/<Video>/`: `Media/` for anything that gets edited, with `Footage/`, `Voiceover/Raw/`, `Music/` and `Images/` inside it, plus separate `Recso/`, `Audacity/` and `Renders/` folders. Resolve imports one folder, and the rest stays out of the way.",
          ],
        },
        {
          heading: "Opening tools in the right place",
          body: [
            "I made Slatey do more than launch the app. It launches it with each tool's settings already pointed at the project. OBS gets its record directory switched through its profile config or over obs-websocket when it is already running. Audacity gets its save and export directories rewritten, and Recso is pointed at the project through its Automation API, a Unix socket it forgets on quit, so the paths are set again each time.",
            "Resolve was harder. The free Linux build can't be scripted from outside, and its menu scripts run in a sandbox without file access. I made Slatey prepare Resolve's Media Storage and recent-project settings while Resolve is closed, then show the import steps instead of pretending it can click them.",
          ],
        },
        {
          heading: "Cutting pauses without losing sync",
          body: [
            "For Cut pauses, I used ffmpeg's `silencedetect`, snapped every cut point to a video frame boundary, and removed the frames and the matching audio in a single pass. The audio stays in sync no matter how many cuts there are, which a naive concatenate gets wrong.",
            "I chose FLAC for the audio because the free Linux build of Resolve can't read AAC. AV1 sources re-encode with NVENC when an NVIDIA GPU is present and with SVT-AV1 otherwise. H.264 and HEVC go through NVENC or x264.",
          ],
        },
        {
          heading: "Voiceover polish",
          body: [
            "For Polish voiceover, I read the raw takes from `Media/Voiceover/Raw/` and write a de-essed, loudness-levelled mono 48 kHz, 24-bit WAV to `Media/Voiceover/`. The default target is −16 LUFS with a −1.5 dB true-peak ceiling, and Gentle/Strong settings cover consonants that lose clarity or takes that still hiss.",
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
        "I built aisprite as a pixel art editor with an AI agent that uses the same drawing operations as the tools. Every edit is a list of ops, the agent gets those ops as its only tools, and it sees a rendered PNG after each draw so it can critique and fix its own work. The same editor is also served to Claude and other MCP clients, so the agent can work from outside the browser.",
      sections: [
        {
          heading: "Ops are the drawing language",
          body: [
            "Every action in the editor becomes a list of ops: pencil, fill, rectangle, layer, palette and frame. I kept the document model in pure TypeScript with no React or DOM, made documents immutable, and shared layers that don't change between versions, which keeps undo history cheap.",
            "I used the same zod schema to validate a tool call and to define the tool the model sees. Applied ops stream back to the browser as NDJSON, so a run appears as it is drawn and the whole AI run is a single undo step.",
          ],
        },
        {
          heading: "The model has to see what it drew",
          body: [
            "A text model can't judge a sprite it can't see, so I made `draw` return a rendered PNG of the sprite and `view` return one layer as an image plus a character grid for exact coordinates. The agent draws, looks and fixes. The editor's own AI panel and an MCP client both use that loop.",
          ],
        },
        {
          heading: "Local and hosted MCP",
          body: [
            "I made `pnpm mcp` run the editor as a stdio MCP server with no model inside it. The calling agent does the drawing. I built a hosted version that serves the same tools over HTTP, stores sprites in Upstash Redis, and can be added to claude.ai as a connector. Local sprites are files with live two-way sync, and if both sides change at once the file's version is kept.",
          ],
        },
        {
          heading: "An editor first",
          body: [
            "I built the editor first: it handles frames, layers, onion skin, mirror brushes, palette editing, pixel-perfect zoom and animation playback, and exports to PNG, animated GIF, a sprite sheet or a ZIP of layers. The AI panel is an addition to an editor that works without a key.",
          ],
        },
      ],
    },
  },
  {
    slug: "kickstart-express",
    name: "Kickstart Express",
    tagline: "A CLI that scaffolds Express apps, then adds a database or auth",
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
        "I wrote Kickstart Express as a CLI that scaffolds a production-shaped Express project in one command, with a choice of TypeScript or JavaScript, optional Docker, and a controllers/services/routes layout. It also has an `add` command that keeps extending the project after the first scaffold.",
      sections: [
        {
          heading: "The same setup every time",
          body: [
            "Every new Express service starts with the same twenty minutes: init the package, wire TypeScript, add CORS and dotenv, decide on a folder layout, write a Dockerfile. None of that is hard, but I repeated it every time, and it came out slightly different on each project.",
          ],
        },
        {
          heading: "One command, running server",
          body: [
            "I made the CLI interactive by default, with five questions: name, language, Docker, src folder, structured architecture. Passing the same answers as flags skips the prompts, which is what makes the tool usable inside scripts and other generators.",
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
            "Most scaffolders are useful for the first command and then stop helping, so I added an `add` command so the tool stays useful past minute one: `add database` wires up MongoDB or Postgres with Mongoose, Prisma or Drizzle, and `add auth` sets up JWT or Clerk. Both work interactively or with flags.",
            "I also dropped the `create` subcommand, making scaffolding the default behaviour, and added graceful Ctrl+C handling that removes half-written project directories instead of leaving them behind.",
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
            "I generate projects with Express, CORS and dotenv configured, hot reload through tsx or nodemon, build and start scripts, and a multi-stage Dockerfile plus docker-compose when asked for. I ship a small calculator API in the structured template as a worked example of the controller/service/route split.",
          ],
        },
      ],
    },
  },
  {
    slug: "company-logos",
    name: "Company Logos",
    tagline:
      "An npm package that copies company logo components into your project",
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
        "I built Company Logos as a CLI that writes company logo components straight into a React project. It applies shadcn's copy-in model to brand SVGs, so the logos become source you can restyle instead of another dependency to ship.",
      sections: [
        {
          heading: "Copy, don't install",
          body: [
            "Icon packages make you ship the whole set to use three glyphs, and you can't edit what you pulled in. Following shadcn's approach, I made `company-logos` write the component file into your project. From then on it is ordinary source you can restyle, resize or delete.",
          ],
          code: {
            language: "bash",
            content:
              "npx company-logos add vercel next github --tsx\nnpx company-logos add --all --jsx",
          },
        },
        {
          heading: "TypeScript or JavaScript",
          body: [
            "I used `--tsx` and `--jsx` to decide what gets written, so the same command works in a typed Next.js app and a plain Vite one. I added `--force` to overwrite existing files and `--all` to take everything.",
          ],
        },
        {
          heading: "Keeping track of what was added",
          body: [
            "I record added components in a `logos.json` manifest at the project root, so `company-logos list` can tell you what is already installed and `available` can show what isn't. I fetch components from GitHub at add time, which keeps the published package small.",
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
        "I built Messy UI as a growing collection of animated React components, distributed through the shadcn CLI. It started as a place to keep the creative-programming pieces that would otherwise be lost in one-off projects, and the registry is the part that made them reusable.",
      sections: [
        {
          heading: "The preview was the hard part",
          body: [
            "I left the library unbuilt for about half a year because of one unsolved problem: a single preview surface that could host two very different kinds of component. Inline components are atomic and self-contained, while sandboxed ones only make sense inside a full page environment where their position and surroundings matter. Solving that split is what finally let me build the registry.",
          ],
        },
        {
          heading: "Installable with one command",
          body: [
            "I publish every component as a shadcn registry entry, so adding one uses the same command as shadcn/ui. There is no new tooling to learn, and the code goes into your project rather than into node_modules.",
          ],
          code: {
            language: "bash",
            content:
              "npx shadcn@latest add https://messyui.dev/r/animated-counter.json\nnpx shadcn@latest add https://messyui.dev/r/hold-button.json",
          },
        },
        {
          heading: "The AI-generated parts",
          body: [
            "I say it plainly in the README: parts of this library are AI-generated, and I am rewriting them by hand. Without that starting push I would not have built the project at all, and half a year of not shipping is its own kind of answer.",
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
        "I wrote the tweakcn CSS Import plugin for Figma to take the CSS variables a tweakcn theme produces and turn them into a usable colour palette inside Figma.",
      sections: [
        {
          heading: "Closing the loop between code and design",
          body: [
            "tweakcn is a visual theme editor for shadcn/ui. It hands you a block of CSS custom properties, and I kept copying hex values into Figma one at a time, which is the kind of transcription that goes wrong without anyone noticing. I wrote the plugin to parse the CSS and generate the palette in Figma, so the design file and the codebase start from identical values.",
          ],
        },
        {
          heading: "Built on the Figma plugin API",
          body: [
            "I wrote it in TypeScript against @figma/plugin-typings and published it to the Figma Community, where 182 people use it.",
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
        "I built Vim Interactive Tutor to recreate the vimtutor experience in the browser with 24 lessons across seven levels. Each lesson has a task, a visible target and automatic completion detection, and it runs against an emulated Vim rather than a text box with instructions beside it.",
      sections: [
        {
          heading: "Learning Vim by doing it",
          body: [
            "I knew reading about `ciw` doesn't teach `ciw`, so every lesson gives you a buffer with a specific starting state and a task: delete this word, change what is inside the quotes, move three words and replace one. I made it check the resulting text and cursor position rather than counting keystrokes, and I saved progress in local storage so you can stop and resume without an account or a backend.",
          ],
        },
        {
          heading: "Emulating Vim",
          body: [
            "I implemented Normal, Insert, Visual, Visual-Line, Command and Replace modes, with counts, motions and operators that compose the way Vim's do: `3w`, `d2j`, `ci(` and command chains after `:`. I made the virtual shell answer `:w`, `:!ls`, `:!pwd`, `:!date`, `:set` and `:help`, so the lesson about saving and quitting doesn't dead-end. That composition is the part most tutorials skip. I didn't want a tutorial that only supported the exact keys in each lesson, because it falls apart the moment someone tries something one character different.",
          ],
        },
        {
          heading: "No backend",
          body: [
            "I built the whole thing as a Vite app with React 19, TypeScript, Tailwind and shadcn/ui components, and deployed it as static files. There is no server to keep alive and nothing to sign up for before the first lesson.",
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
        "I run a self-hosted film and TV setup on one laptop. Seerr takes the request, Radarr and Sonarr find a release, Prowlarr hands them indexers, qBittorrent downloads it and Jellyfin plays it. I added two smaller services for the gaps: subgate rejects releases without English subtitles or audio, and library is a FastAPI page for the jobs the Arr interfaces don't handle.",
      sections: [
        {
          heading: "From request to playback",
          body: [
            "Requests go into Seerr, which talks to Radarr for films and Sonarr for shows. Both search through Prowlarr and hand the chosen release to qBittorrent, and finished downloads are imported back into the library and served by Jellyfin. Bazarr fills in subtitles, Recyclarr keeps quality profiles current, and FlareSolverr gets Prowlarr past Cloudflare.",
            "I bind the Arrs and qBittorrent to `127.0.0.1`, while Jellyfin, Seerr and the library page are reachable from the LAN. I run everything in Docker on the same machine. The alternative was four subscriptions.",
          ],
        },
        {
          heading: "subgate: reject before the download runs",
          body: [
            "A release with no English subtitles and no English audio is worthless here, and finding that out after a 20 GB download wastes an evening. I wrote subgate to watch the Radarr and Sonarr queues and check the torrent before it commits.",
            "If the file list contains an English subtitle file, it passes immediately. Otherwise subgate downloads only the largest non-sample video, sequentially, with first and last piece priority, until the first 4 MiB are on disk, then asks `ffprobe` what tracks exist. An English subtitle or audio track passes, and a Hindi audio track passes for films. If neither is there, the queue entry is removed with `blocklist=true`, and the Arr searches the next release on its own.",
            "I made subgate measure timeouts in active download time, so a torrent queued overnight isn't rejected for being slow. It rejects a release that never becomes readable as an unreadable header after 16 MiB.",
          ],
        },
        {
          heading: "library: the page the Arr interfaces don't have",
          body: [
            "The Arr UIs are built for managing indexers and quality profiles, not for browsing what is on disk, so I wrote the library page in FastAPI, Jinja and htmx in one container. It shows the files season by season, handles search and add, keeps a watchlist, follows airing anime, and has an import tab with a rescue path for failed imports plus cleanup for leftover torrents and orphaned files.",
            "I also added playlists that survive a re-import and a per-show TV toggle that hides a title from the TV's Jellyfin user without touching anyone else's library. It is password-protected and lives on the LAN, which is enough auth for one household.",
          ],
        },
        {
          heading: "The TV end",
          body: [
            "I also run the library as a Fire TV app. One WebView finds the server by scanning the LAN and takes its basic-auth credentials from the install script, then I inject the gruvbox palette at 1.5× so the rows read from the sofa.",
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
        "I built DukanBook to replace a paper cash book for a halwai business. One sheet per business day records the closing drawer count, two cash-in-hand piles and the day's expenses, and sales are never typed in: they are what the cash movement proves.",
      sections: [
        {
          heading: "Sales come out of the cash",
          body: [
            "I made CIH3 the total cash in hand, always the sum of the two piles: `CIH3 = CIH1 + CIH2`. A day's sales are `CIH3 − the previous CIH3 + expenses`. A first day has no previous day, so I measure it against the starting cash in Settings, which keeps the float already in the shop from being counted as that day's sales.",
            "The closing drawer is the counted figure. The notes and coins left in it are the float that carries into the next day, so there is no opening drawer to enter.",
          ],
        },
        {
          heading: "Money as integers",
          body: [
            "I store money as `numeric(14,2)`, while TypeScript works in integer paise. The accounting functions are pure, with no React or database handle, and have their own unit tests. I save a day in one transaction and write an audit row, and I void expenses rather than deleting them so the original amount stays visible.",
          ],
        },
        {
          heading: "Small on purpose",
          body: [
            "The app serves one shop, with one PIN and one book. I didn't use an ORM: I wrote versioned SQL migrations and a small runner. I use Neon's pooled URL for the app and the direct URL for migrations, because PgBouncer's transaction mode breaks session-level work.",
            "I made the reports cover one month at a time, with a CSV export, a settings lock and an audit trail. The negative-sales case has its own notes in the accounting module instead of being clamped to zero.",
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
        "I built DealForge to pull deals from Amazon and Flipkart, wrap Ajio links in an affiliate tracker, and post them to a Telegram channel and a live site. The affiliate APIs are gated, so the first version works from a manual queue, and I switch the automatic pullers on when the accounts are approved.",
      sections: [
        {
          heading: "The gates are part of the design",
          body: [
            "Amazon's Creators API needs 10 qualifying sales in the past 30 days before it hands over product data, and Flipkart needs an approved affiliate account. Ajio's network gives a click tracker rather than a product feed, so a link can be wrapped but the price still comes from the post. I made the manual queue usable from day one: paste a deal, the link gets tagged, and the same filters, dedupe and price history run. When access opens, I flip `enabled = true` and the pullers turn on.",
          ],
        },
        {
          heading: "A 48-hour window",
          body: [
            "I push the last 48 hours of deals from the laptop to `POST /api/deals`, and the site replaces the whole window in one transaction. Every row carries `expires_at`, so if the laptop stops pushing, the site stops serving deals instead of showing stale prices. An empty push is rejected unless the body explicitly allows it.",
          ],
        },
        {
          heading: "Two clients, one feed",
          body: [
            "I built Telegram first, including multi-product digests from private channels. I built the site with Next.js and Postgres on Neon: it revalidates every minute, and a push revalidates the deal routes immediately. Images go through `next/image` with a week-long CDN cache.",
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
        "I built Headcount as a casual Android game where you steer a crowd through multiply and divide gates, grow it into an army, and fight a wave every thirty seconds. I generate all of the art and audio in code, and I kept the rules in a pure Kotlin module so they can be tested without a phone.",
      sections: [
        {
          heading: "The crowd is the weapon",
          body: [
            "I made every gate multiply or divide the crowd. Power is crowd × strength, and a fight costs people equal to the enemy power divided by your strength. The first boss, at wave 5, is 1.7× the wave's power.",
            "I tuned the numbers with a headless bot that plays 200 seeded runs per profile. Its medians are wave 5 on a fresh save, wave 10 after a week of upgrades, and wave 25 with everything maxed, and I used those medians to set the curve.",
          ],
        },
        {
          heading: "Rules without Android",
          body: [
            "I kept the core module in plain Kotlin: gates, perks, leaders, economy, missions and the save codec. It runs on the JVM, so the balance simulation and unit tests don't need an emulator. I plan a run one segment at a time from a seed and the crowd at that moment, which is also what makes the daily track reproducible.",
          ],
        },
        {
          heading: "Art and audio from code",
          body: [
            "I draw sprites into atlases at two sizes, and the crowd, gates and scenery render in Compose and Filament. The music is deterministic mono PCM at 22,050 Hz and 128 BPM, with 16 synthesised effects. I didn't download any images or audio, which means no licence to chase for the store build.",          ],
        },
        {
          heading: "Built for the store",
          body: [
            "I ship a signed AAB with Play Billing for a one-time No Ads Pack, AdMob rewarded ads, a privacy policy on the studio site, and a store listing with screenshots and a feature graphic. It is in closed testing on Google Play.",
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
        "I wrote razorrecon to match Razorpay settlements to bank credits. It walks the whole chain from order to payment to settlement to the credit in the bank, naming every fee, GST deduction, refund and chargeback along the way. I report the match rate next to the number of wrong matches, because one without the other means nothing.",
      sections: [
        {
          heading: "Two halves of the chain",
          body: [
            "Most reconciliation tools match settlements to bank credits and stop there, which says money arrived but not that the amount was right. I check the first half, which covers payments against settlements after fees, GST, refunds, chargebacks and adjustments. I check the second half, which covers the settlement against the bank credit, where references are cut short, value dates move, and a credit can arrive split, duplicated or reversed.",
          ],
        },
        {
          heading: "The answers are sealed by the compiler",
          body: [
            "I put the ground truth in `recon-sim`, while the matching engine only depends on `recon-core`, so it can't even name the type that holds the answers. The engine has no way to read the answers, which is why zero wrong matches is something you can check.",
          ],
        },
        {
          heading: "An explanation has to add up",
          body: [
            "I gave `Resolution` private fields and one constructor. `Resolution::close` returns an error when the parts don't add up to the difference in exact paise, so a shaky explanation can't be saved. I store every amount as whole paise. GST on a fee produces fractions of a paise, and floating point would turn those crumbs into gaps that were never there.",
          ],
        },
        {
          heading: "Three answers, one sorted list",
          body: [
            "I return three verdicts: MATCHED when a settlement is traced end to end, AWAITING when it is inside its SLA and the credit isn't due yet, and EXCEPTION when it is still open with the possible causes listed. I sort exceptions by money at risk.",
            "Over 90 days, the spreadsheet lookup matched 62.0% and got 8 wrong. razorrecon matched 88.7% with 0 wrong and left 31 exceptions instead of 126. The ceiling on that data is 98.4%, because 27 of the 274 units can't be closed by anyone.",
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
        "I wrote recoup to decide what to do after a Razorpay payment fails. It treats the failure code as a distribution over causes, scores nine recovery actions by expected value, and only spends a model on the 16% of failures a lookup can't explain.",
      sections: [
        {
          heading: "The code hides the cause",
          body: [
            "`card_declined` from `issuer_bank` can come from seven different causes, and each one wants a different recovery. Retrying three times is the usual answer. I built a lookup from the tuple Razorpay reports, method, reason, code, source and step, that resolves 76% of card failures to one cause with no inference. 81.8% of all decisions come from that lookup.",
          ],
        },
        {
          heading: "A distribution over causes",
          body: [
            "For the rest, I made diagnosis return probabilities. I score every action as expected value: the probability of each cause, the chance that action succeeds for that cause at that time, the amount, the chance the customer is still there after the wait, minus the cost. Carrying the whole distribution means the agent often doesn't need to know the cause, and asking for a new card is a decent move under several of them.",
          ],
        },
        {
          heading: "Nothing is keyed to a constant",
          body: [
            "\"Retry in three days\" appears nowhere. I didn't key timing to a constant. The agent learns it from when that customer's own charges went through, and about 18% have no pattern at all. I added an outage detector that found 4 of 4 outages with a mean time of 39 minutes and no false alarms over 14 days.",
          ],
        },
        {
          heading: "What it recovered",
          body: [
            "On the committed 14-day world, the run had 788,378 attempts, 44,863 failures and Rs 15,00,21,139 at risk. The retry-3x baseline recovered 27.9%, while I measured 41.4% net recovery for recoup after contact costs and discounts. The physical ceiling is 46.7%, an oracle with perfect diagnosis reaches 43.4%, and the headroom left in diagnosis is 2.0 points.",
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
        "I built Sutra as a desktop note app. Pick a vault folder, edit Markdown in CodeMirror with Vim bindings, and see the links between notes as a force graph. I used Tauri for the window and the filesystem, and there is no server or account.",
      sections: [
        {
          heading: "The vault is the database",
          body: [
            "I made the app open on a vault picker. Everything after that is files: I use `tauri-plugin-fs` to read, write and watch the folder, and a Zustand store keeps the open folder, file and tabs. Nothing leaves the machine.",
          ],
        },
        {
          heading: "A real editor",
          body: [
            "I used CodeMirror 6 for Markdown, with KaTeX for maths, a Vim mode for people who want it, and language data for code blocks. The editor is the center of the app, and the shell around it stays out of the way.",
          ],
        },
        {
          heading: "The link graph",
          body: [
            "I turn notes into nodes and their links into edges in a D3 force graph. It opens as a tab beside the editor, so the shape of the vault is one click away from the file you are writing.",
          ],
        },
        {
          heading: "Why Tauri",
          body: [
            "I chose Tauri because it uses the system webview instead of shipping Chromium, and I kept the filesystem and graph commands in Rust. The front end is React 19 and Vite. The app is at 0.1.0 and still growing.",
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
        "I built VideoShare to send a video to a client without handing over the file. Uploads land in Google Cloud Storage, playback streams through the app, and a share link carries an expiry, a view limit and a watermark.",
      sections: [
        {
          heading: "The object URL never leaves the server",
          body: [
            "I store videos in Google Cloud Storage, but I never give the client a signed object URL. Playback goes through a Next.js route I wrote that streams the object, so access is checked on every request.",
          ],
        },
        {
          heading: "Watermarks and view limits",
          body: [
            "I let each share carry a text watermark with its own position and opacity, a time limit and a maximum number of views. I block downloads in several layers, including the keyboard shortcuts people reach for first.",
          ],
        },
        {
          heading: "Accounts, metadata and storage",
          body: [
            "I used Clerk for accounts and Postgres with Drizzle for users, video metadata and `video_access` rows. I track storage usage per user. The app is Next.js 15, TypeScript, Tailwind and Radix.",
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
        "I built the Code Execution Platform as a web editor that runs code in four languages on a Linux host. Every run gets its own user and its own limits, and I put the Express backend behind Nginx with TLS.",
      sections: [
        {
          heading: "A user per run",
          body: [
            "I create a unique `exec_${uuid}` Linux user for each request. Nothing is shared between executions, and I remove the user afterwards. The isolation comes from the operating system rather than a JavaScript sandbox.",
          ],
        },
        {
          heading: "CPU, memory and process limits",
          body: [
            "I give runs 10 seconds of CPU, 40 processes and a memory ceiling through ulimit. I start each execution in its own process group, send SIGTERM at the limit, and clean up orphans so a runaway program can't leave anything behind.",
          ],
        },
        {
          heading: "Fifty at a time",
          body: [
            "I added a semaphore to cap concurrency, and a single Linux VPS handled 50+ concurrent runs. I used Express and TypeScript for the backend, Monaco for the editor, Docker Compose for the stack, and Nginx to terminate TLS.",
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
        "I built Auto-CIDE to put Monaco in a browser tab, sync edits between people over Socket.IO, and run a frontend, a backend and MongoDB from one Docker Compose file. Code runs in a WebContainer inside the browser, so the backend never executes user code.",
      sections: [
        {
          heading: "Two people, one buffer",
          body: [
            "I send edits over Socket.IO, so every connected client sees the same buffer. Monaco supplies the editor, syntax highlighting and IntelliSense.",
          ],
        },
        {
          heading: "Run it without a server",
          body: [
            "I used WebContainer to execute the project in the browser. The backend doesn't spawn a sandbox for user code, which keeps the deployment to the app, the API and the database.",
          ],
        },
        {
          heading: "Sessions and one command",
          body: [
            "I used JWT for sessions and left Redis optional for caching. `docker compose up` starts the frontend, backend and MongoDB together, and I added an AI endpoint behind the editor for suggestions and questions.",
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
