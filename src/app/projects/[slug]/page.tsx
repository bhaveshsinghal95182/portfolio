import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArrowTopRight2 from "@/components/arrow-up";
import { getProject, projects } from "@/lib/projects";
import { getPortfolioData } from "@/lib/project-stats";
import { formatCompact } from "@/lib/stats";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Renders `backticked` spans in case-study prose as inline code. */
function RichText({ children }: { children: string }) {
  return (
    <>
      {children.split(/(`[^`]+`)/g).map((part, index) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={index}
            className="font-mono text-[0.85em] rounded bg-muted-black/10 px-1 py-0.5"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const description = project.caseStudy?.summary ?? project.tagline;

  return {
    title: project.name,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.name,
      description,
      url: `/projects/${project.slug}`,
    },
    twitter: { card: "summary_large_image", title: project.name, description },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Reuses the same daily-cached fetches as the home page.
  const { projects: withStats } = await getPortfolioData();
  const stats = withStats.find((item) => item.slug === slug);

  const externalLinks = [
    { label: "Live", href: project.url },
    project.repo ? { label: "Source", href: project.repo } : null,
    project.npmPackage
      ? {
          label: "npm",
          href: `https://www.npmjs.com/package/${project.npmPackage}`,
        }
      : null,
  ].flatMap((link) => (link ? [link] : []));

  return (
    <article className="pb-16">
      <Link
        href="/projects"
        className="font-mono text-xs text-muted-black hover:text-accent transition-colors"
      >
        ← all projects
      </Link>

      <header className="mt-4">
        <h1 className="tracking-[-0.05em] text-primary font-playfair text-3xl">
          {project.name}
        </h1>
        <p className="font-jost text-body text-sm mt-1">{project.tagline}</p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span
            className={`badge badge-${project.accent} px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md`}
          >
            {stats?.milestone ?? project.fallbackMilestone}
          </span>
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="px-1.5 py-0.5 text-[10px] font-mono rounded-md border border-muted-black/25 text-muted-black"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          {externalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-[12px] font-poppins text-muted-black hover:text-accent lowercase"
            >
              <span>{link.label}</span>
              <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                <ArrowTopRight2 size="13" />
              </span>
            </Link>
          ))}
        </div>
      </header>

      {(stats?.weeklyDownloads || stats?.stars) && (
        <dl className="mt-6 flex gap-8 border-y border-muted-black/20 py-3">
          {stats?.weeklyDownloads ? (
            <div>
              <dd className="font-mono text-base text-title">
                {formatCompact(stats.weeklyDownloads)}
              </dd>
              <dt className="font-jost text-[10px] uppercase tracking-wide text-muted-black">
                weekly downloads
              </dt>
            </div>
          ) : null}
          {stats?.stars ? (
            <div>
              <dd className="font-mono text-base text-title">{stats.stars}</dd>
              <dt className="font-jost text-[10px] uppercase tracking-wide text-muted-black">
                github stars
              </dt>
            </div>
          ) : null}
        </dl>
      )}

      {project.caseStudy ? (
        <div className="mt-8">
          <p className="font-jost text-body text-[15px]/relaxed">
            <RichText>{project.caseStudy.summary}</RichText>
          </p>

          {project.caseStudy.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="font-jost font-medium tracking-tight text-title">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="font-poppins text-body text-sm/relaxed mt-2"
                >
                  <RichText>{paragraph}</RichText>
                </p>
              ))}
              {section.code ? (
                <pre className="mt-3 overflow-x-auto rounded-lg border border-muted-black/20 bg-surface p-3">
                  <code className="font-mono text-xs text-body whitespace-pre">
                    {section.code.content}
                  </code>
                </pre>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}
    </article>
  );
}
