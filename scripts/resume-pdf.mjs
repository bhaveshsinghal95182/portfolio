#!/usr/bin/env node
/**
 * Build public/resume.pdf from the same data as the /resume page.
 *
 *   pnpm resume:pdf
 *
 * The page and the download used to be maintained by hand, so they drifted.
 * This renders resume.ts and the featured projects from projects.ts into a
 * print layout and asks Chrome for the PDF. No LaTeX, no second copy of the
 * content.
 */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const {
  contact,
  certifications,
  education,
  experience,
  skills,
  summary,
} = await import(pathToFileURL(join(root, "src/lib/resume.ts")).href);
const { projects } = await import(
  pathToFileURL(join(root, "src/lib/projects.ts")).href
);

const featured = projects.filter((project) => project.featured);

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function link(href, label) {
  return `<a href="${esc(href)}">${esc(label)}</a>`;
}

function pretty(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

const contactLine = [
  esc(contact.phone),
  link(`mailto:${contact.email}`, contact.email),
  link(contact.site, pretty(contact.site)),
].join('<span class="sep">|</span>');

const contactLineTwo = [
  link(contact.github, pretty(contact.github)),
  link(contact.linkedin, pretty(contact.linkedin)),
].join('<span class="sep">|</span>');

const experienceHtml = experience
  .map(
    (job) => `
    <section class="entry">
      <div class="entry-head">
        <h3>${esc(job.title)} <span class="at">·</span> ${esc(job.company)}</h3>
        <span class="meta">${esc(job.duration)} <span class="sep">|</span> ${esc(job.location)}</span>
      </div>
      <ul>
        ${job.highlights.map((point) => `<li>${esc(point)}</li>`).join("\n        ")}
      </ul>
    </section>`,
  )
  .join("");

const projectsHtml = featured
  .map((project) => {
    const href = project.url ?? project.repo ?? `${contact.site}/projects/${project.slug}`;
    return `
    <section class="entry project">
      <div class="entry-head">
        <h3>${link(href, project.name)}</h3>
        <span class="meta">${esc(project.stack.join(" · "))}</span>
      </div>
      <p class="sub">${esc(project.tagline)}</p>
    </section>`;
  })
  .join("");

const certificationsHtml = certifications
  .map((certification) => {
    const name = certification.credentialUrl
      ? link(certification.credentialUrl, certification.name)
      : esc(certification.name);
    return `<li><span>${name} <span class="issuer">· ${esc(certification.issuer)}</span></span><span class="meta">${esc(certification.issueDate)}</span></li>`;
  })
  .join("\n      ");

const educationHtml = education
  .map(
    (item) => `
    <section class="entry">
      <div class="entry-head">
        <h3>${esc(item.qualification)}</h3>
        <span class="meta">${esc(item.detail ?? "")}</span>
      </div>
      <p class="sub">${esc(item.institution)}</p>
    </section>`,
  )
  .join("");

const skillsHtml = skills
  .map(
    (group) =>
      `<dt>${esc(group.group)}</dt><dd>${esc(group.items.join(", "))}</dd>`,
  )
  .join("\n      ");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Bhavesh Singhal - Resume</title>
<meta name="author" content="Bhavesh Singhal">
<style>
  @page { size: Letter; margin: 0.5in 0.55in; }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    color: #1a1a1a;
    font: 9.7pt/1.33 "Liberation Sans", Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  a { color: #1a1a1a; text-decoration: none; border-bottom: 0.5px solid #c9c9c9; }

  header { border-bottom: 1.5px solid #b03333; padding-bottom: 7px; }

  h1 {
    margin: 0;
    font: 700 24pt/1.05 "Liberation Serif", Georgia, serif;
    letter-spacing: -0.01em;
  }

  .contact { margin-top: 5px; color: #4a4a4a; font-size: 8.7pt; }
  .contact + .contact { margin-top: 1px; }
  .sep { color: #b8b8b8; padding: 0 5px; }
  .summary { margin: 7px 0 0; color: #333; font-size: 9.4pt; line-height: 1.35; }

  h2 {
    margin: 13px 0 4px;
    color: #b03333;
    font-size: 8.6pt;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .entry { margin-top: 6px; page-break-inside: avoid; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
  h3 { margin: 0; font-size: 10.2pt; font-weight: 700; }
  .at { color: #777; font-weight: 400; }
  .meta { color: #5b5b5b; font-size: 8.8pt; white-space: nowrap; }
  .sub { margin: 1px 0 0; color: #4a4a4a; font-size: 9pt; }
  .issuer { color: #5b5b5b; font-weight: 400; }

  ul { margin: 2px 0 0 15px; padding: 0; }
  li { margin: 1px 0; }

  .project { margin-top: 4px; }
  .project .sub { margin-top: 0; }

  .skills { display: grid; grid-template-columns: 92px 1fr; gap: 1.5px 10px; margin: 0; }
  .skills dt {
    color: #5b5b5b;
    font-size: 8pt;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding-top: 1px;
  }
  .skills dd { margin: 0; }

  .certs { margin: 0; padding: 0; list-style: none; }
  .certs li { display: flex; justify-content: space-between; gap: 14px; margin: 2px 0; }
</style>
</head>
<body>
  <header>
    <h1>Bhavesh Singhal</h1>
    <div class="contact">${contactLine}</div>
    <div class="contact">${contactLineTwo}</div>
    <p class="summary">${esc(summary)}</p>
  </header>

  <h2>Experience</h2>
  ${experienceHtml}

  <h2>Selected Projects</h2>
  ${projectsHtml}

  <h2>Skills</h2>
  <dl class="skills">
    ${skillsHtml}
  </dl>

  <h2>Certifications</h2>
  <ul class="certs">
    ${certificationsHtml}
  </ul>

  <h2>Education</h2>
  ${educationHtml}
</body>
</html>
`;

const chromeCandidates = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const chrome = chromeCandidates.find((candidate) => existsSync(candidate));
if (!chrome) {
  console.error(
    "No Chrome or Chromium found. Set CHROME_PATH to the binary and try again.",
  );
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "portfolio-resume-"));
const htmlPath = join(work, "resume.html");
const output = join(root, "public/resume.pdf");

try {
  writeFileSync(htmlPath, html);

  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=5000",
      `--print-to-pdf=${output}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    console.error("Chrome could not write the PDF.");
    process.exit(1);
  }

  console.log(`wrote ${output}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
