import type { MetadataRoute } from "next";
import { posts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

/**
 * Static pages carry no lastModified: they have no single source date, and a
 * build-time `new Date()` lies to crawlers on every deploy. Projects and posts
 * use the date their content actually changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), priority: 1 },
    { url: absoluteUrl("/projects"), priority: 0.8 },
    { url: absoluteUrl("/writing"), priority: 0.8 },
    { url: absoluteUrl("/resume"), priority: 0.6 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      ...(project.updated
        ? { lastModified: new Date(`${project.updated}T00:00:00Z`) }
        : {}),
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/writing/${post.slug}`),
      lastModified: new Date(`${post.date}T00:00:00Z`),
      priority: 0.7,
    })),
  ];
}
