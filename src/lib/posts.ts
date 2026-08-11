import type { ComponentType } from "react";

export interface Post {
  slug: string;
  title: string;
  /** Used for meta description, the index page and the RSS item summary. */
  description: string;
  /** ISO date — drives sort order and the RSS pubDate. */
  date: string;
  tags: string[];
  /** Rough reading time in minutes. */
  readingTime: number;
  /** MDX body. Imports are explicit so the bundler can see every post. */
  load: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
}

/**
 * Add a post by dropping an .mdx file in src/content/posts and adding an entry
 * here. Sorted newest-first at the bottom of this file.
 */
const entries: Post[] = [
  {
    slug: "rebuilding-this-site",
    title: "Rebuilding this site",
    description:
      "Replacing hardcoded brag numbers with live ones, and the small details that took longer than they should have.",
    date: "2026-08-11",
    tags: ["next.js", "craft"],
    readingTime: 3,
    load: () => import("@/content/posts/rebuilding-this-site.mdx"),
  },
];

export const posts: Post[] = [...entries].sort((a, b) =>
  b.date.localeCompare(a.date),
);

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
