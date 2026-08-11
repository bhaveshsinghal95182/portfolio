import type { Metadata } from "next";
import Link from "next/link";
import { formatPostDate, posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes on building developer tools, shipping small products, and the details that take longer than they should.",
  alternates: {
    canonical: "/writing",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default function WritingPage() {
  return (
    <div className="pb-16">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="tracking-[-0.05em] text-primary font-playfair text-3xl">
          Writing
        </h1>
        <a
          href="/feed.xml"
          className="font-mono text-xs text-muted-black hover:text-accent transition-colors"
        >
          rss
        </a>
      </div>

      {posts.length === 0 ? (
        <p className="font-poppins text-body text-sm mt-4">
          Nothing published yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-1">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/writing/${post.slug}`}
                className="group block -mx-3 rounded-lg px-3 py-2 transition-all duration-300 ease-in-out hover:bg-accent/15"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-sans text-sm font-medium tracking-tight text-title group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.date}
                    className="shrink-0 font-mono text-[11px] text-muted-black"
                  >
                    {formatPostDate(post.date)}
                  </time>
                </div>
                <p className="font-poppins text-body text-sm mt-1">
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
