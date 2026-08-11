import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { featuredProjects } from "@/lib/projects";
import { getPortfolioData } from "@/lib/project-stats";
import { certifications, education, experience, skills } from "@/lib/resume";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${site.name} — experience, projects, certifications and skills.`,
  alternates: { canonical: "/resume" },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-jost text-xs uppercase tracking-[0.2em] text-muted-black border-b border-muted-black/20 pb-1 mb-3">
      {children}
    </h2>
  );
}

export default async function ResumePage() {
  const { projects } = await getPortfolioData();
  const projectStats = new Map(
    projects.map((project) => [project.slug, project.milestone]),
  );

  return (
    <div className="pb-16">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="tracking-[-0.05em] text-primary font-playfair text-3xl">
            {site.name}
          </h1>
          <p className="font-jost text-body text-sm mt-1">
            {site.headline} · {site.location}
          </p>
          <div className="flex flex-wrap gap-3 mt-2 font-mono text-[11px] text-muted-black">
            <a
              href={`mailto:${site.email}`}
              className="hover:text-accent transition-colors"
            >
              {site.email}
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              github.com/{site.githubUser}
            </a>
            <a
              href={site.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              {site.twitterHandle}
            </a>
          </div>
        </div>

        <a
          href="/resume.pdf"
          download="Bhavesh-Singhal-Resume.pdf"
          className="group flex items-center gap-1 whitespace-nowrap text-[12px] font-poppins text-muted-black hover:text-accent lowercase"
        >
          <Download width={13} height={13} />
          Download PDF
        </a>
      </header>

      <section className="mt-8">
        <SectionHeading>Experience</SectionHeading>
        {experience.map((job) => (
          <div key={`${job.company}-${job.title}`} className="mb-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-sans text-sm font-medium tracking-tight text-title">
                {job.title} · {job.company}
              </h3>
              <span className="font-mono text-[11px] text-muted-black">
                {job.duration} · {job.location}
              </span>
            </div>
            <ul className="mt-2 space-y-1 list-disc pl-5 font-poppins text-body text-sm/relaxed">
              {job.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <SectionHeading>Selected projects</SectionHeading>
        <div className="space-y-3">
          {featuredProjects.map((project) => (
            <div key={project.slug}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/projects/${project.slug}`}
                  className="font-sans text-sm font-medium tracking-tight text-title hover:text-accent transition-colors"
                >
                  {project.name}
                </Link>
                <span className="font-mono text-[11px] text-muted-black">
                  {projectStats.get(project.slug) ?? project.fallbackMilestone}
                </span>
              </div>
              <p className="font-poppins text-body text-sm/relaxed mt-0.5">
                {project.tagline}
              </p>
              <p className="font-mono text-[11px] text-muted-black mt-0.5">
                {project.stack.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeading>Skills</SectionHeading>
        <dl className="space-y-2">
          {skills.map((group) => (
            <div
              key={group.group}
              className="flex flex-wrap items-baseline gap-x-3"
            >
              <dt className="font-mono text-[11px] uppercase tracking-wide text-muted-black w-20 shrink-0">
                {group.group}
              </dt>
              <dd className="font-poppins text-body text-sm">
                {group.items.join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8">
        <SectionHeading>Certifications</SectionHeading>
        <ul className="space-y-2">
          {certifications.map((certification) => (
            <li
              key={certification.name}
              className="flex flex-wrap items-baseline justify-between gap-2"
            >
              <span className="font-poppins text-body text-sm">
                {certification.credentialUrl ? (
                  <a
                    href={certification.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {certification.name} ↗
                  </a>
                ) : (
                  certification.name
                )}
                <span className="text-muted-black"> · {certification.issuer}</span>
              </span>
              <span className="font-mono text-[11px] text-muted-black">
                {certification.issueDate}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionHeading>Education</SectionHeading>
        {education.map((item) => (
          <div
            key={item.qualification}
            className="flex flex-wrap items-baseline justify-between gap-2"
          >
            <span className="font-poppins text-body text-sm">
              {item.qualification}
              <span className="text-muted-black"> · {item.institution}</span>
            </span>
            {item.detail ? (
              <span className="font-mono text-[11px] text-muted-black">
                {item.detail}
              </span>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
