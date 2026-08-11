import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { getProject, projects } from "@/lib/projects";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Project case study";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  return renderOgImage({
    kicker: "Case study",
    title: project?.name ?? "Project",
    subtitle: project?.tagline,
  });
}
