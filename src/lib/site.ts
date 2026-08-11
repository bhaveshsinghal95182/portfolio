/**
 * Single source of truth for identity + canonical URL.
 *
 * Set NEXT_PUBLIC_SITE_URL to your real domain in production — it drives OG
 * image URLs, the sitemap, RSS and JSON-LD, all of which need absolute URLs.
 * Falls back to the Vercel deployment URL, then localhost.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const site = {
  name: "Bhavesh Singhal",
  firstName: "Bhavesh",
  roles: ["developer", "designer", "ai enthusiast"],
  headline: "Developer, designer, and AI enthusiast.",
  description:
    "Bhavesh Singhal — CS student building developer tools, npm packages and small SaaS. Creator of Kickstart Express, company-logos and Recso.",
  url: resolveSiteUrl(),
  email: "worknbhavesh@gmail.com",
  location: "Haryana, India",
  school: "MMDU Haryana",
  githubUser: "bhaveshsinghal95182",
  github: "https://github.com/bhaveshsinghal95182",
  twitterHandle: "@descentkatil_",
  twitter: "https://x.com/descentkatil_",
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}
