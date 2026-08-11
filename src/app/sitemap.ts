import type { MetadataRoute } from "next";
import { posts } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: absoluteUrl("/"), lastModified: now, priority: 1 },
    { url: absoluteUrl("/projects"), lastModified: now, priority: 0.8 },
    { url: absoluteUrl("/writing"), lastModified: now, priority: 0.8 },
    { url: absoluteUrl("/resume"), lastModified: now, priority: 0.6 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: now,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/writing/${post.slug}`),
      lastModified: new Date(`${post.date}T00:00:00Z`),
      priority: 0.7,
    })),
  ];
}
