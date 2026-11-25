# bhavesh.recso.dev

Personal site: [bhavesh.recso.dev](https://bhavesh.recso.dev).

Next.js 16 (App Router), React 19, Tailwind CSS 4, MDX. Project download and
star counts come from the npm and GitHub APIs and revalidate once a day.

## Running it

```sh
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
pnpm lint
```

## Open a project page

```sh
pnpm project recso
pnpm project "company logos" --local
pnpm project --list
pnpm project recso --print      # print the URL, do not open a browser
```

`pnpm project` reads the project list from `src/lib/projects.ts`. If a dev
server answers on port 3000 it opens the local page, otherwise the deployed
site. `--live` forces production.

To use it from any directory, link it once:

```sh
pnpm link --global
portfolio recso
```

## Where the content lives

| What | File |
| --- | --- |
| Name, links, description | `src/lib/site.ts` |
| Projects and case studies | `src/lib/projects.ts` |
| Writing entries | `src/lib/posts.ts` + `src/content/posts/*.mdx` |
| Resume page | `src/lib/resume.ts` |
| Resume download | `public/resume.pdf` |

Adding a project means one object in `src/lib/projects.ts`. A post needs the
`.mdx` file and an entry in `src/lib/posts.ts`. Both feed the sitemap, the
command palette and the terminal automatically.

## Resume PDF

`public/resume.pdf` is generated from `src/lib/resume.ts` and the featured
projects, so the page and the download stay in step.

```sh
pnpm resume:pdf
```

It needs Chrome or Chromium. Set `CHROME_PATH` if the binary is not in a
standard location.

## Environment

- `NEXT_PUBLIC_SITE_URL` — the real domain. Drives canonical URLs, the sitemap,
  RSS and OG images. Without it the site falls back to the Vercel URL, then
  localhost.
- `GITHUB_TOKEN` — optional. Lifts the GitHub API rate limit from 60 to 5000
  requests an hour.

## Live numbers

`src/lib/stats.ts` owns every outbound call. Failures return `null`, and the
UI falls back to the static milestone on each project rather than breaking the
page.
