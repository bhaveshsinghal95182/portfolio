import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate, getPost, posts } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      url: `/writing/${post.slug}`,
      tags: [...post.tags],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { default: Content } = await post.load();

  const postUrl = absoluteUrl(`/writing/${post.slug}`);
  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: site.name, url: site.url },
    mainEntityOfPage: postUrl,
    url: postUrl,
    image: absoluteUrl(`/writing/${post.slug}/opengraph-image`),
    keywords: post.tags.join(", "),
  };

  return (
    <article className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }}
      />
      <Link
        href="/writing"
        className="font-mono text-xs text-muted-black hover:text-accent transition-colors"
      >
        ← all writing
      </Link>

      <header className="mt-4">
        <h1 className="tracking-[-0.05em] text-primary font-playfair text-3xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-muted-black">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span className="bg-muted-black h-1 w-1 rounded" />
          <span>{post.readingTime} min read</span>
        </div>
      </header>

      <div className="mt-6">
        <Content />
      </div>
    </article>
  );
}
