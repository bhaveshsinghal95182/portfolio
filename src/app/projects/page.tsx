import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DownloadsChart from "@/components/downloads-chart";
import { type ChartConfig } from "@/components/ui/chart";
import { getPortfolioData } from "@/lib/project-stats";
import { formatCompact } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "npm packages, products and plugins — with live download numbers straight from the npm registry.",
  alternates: { canonical: "/projects" },
};

const CHART_COLORS = [
  "var(--color-chart-blue)",
  "var(--color-chart-green)",
] as const;

export default async function Page() {
  const { packages, projects } = await getPortfolioData();
  const products = projects.filter(
    (project) => project.category === "product" && project.icon,
  );

  return (
    <div className="font-mono pb-12">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl tracking-tight font-jost">Npm packages</h1>
        <div className="flex flex-col gap-8 md:flex-row md:gap-4 w-full mt-2">
          {packages.map(({ project, monthly, weekly, total }, index) => {
            const chartConfig = {
              downloads: {
                label: "downloads",
                color: CHART_COLORS[index % CHART_COLORS.length],
              },
            } satisfies ChartConfig;

            return (
              <div key={project.slug} className="w-full">
                <DownloadsChart chartData={monthly} chartConfig={chartConfig} />
                <Link href={`/projects/${project.slug}`}>
                  <h2 className="text-lg tracking-tight group relative inline-block cursor-pointer">
                    {project.name}
                    <span className="absolute left-0 bottom-0 h-px w-0 bg-current transition-all duration-300 ease-out group-hover:w-full"></span>
                  </h2>
                </Link>
                <p className="text-xs text-muted-black mt-1">
                  {weekly !== null ? `${formatCompact(weekly)}/week · ` : ""}
                  {total > 0 ? `${formatCompact(total)} all time` : "npm"}
                </p>
                <Link
                  href={`https://www.npmjs.com/package/${project.npmPackage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-black hover:text-accent transition-colors"
                >
                  view on npm ↗
                </Link>
              </div>
            );
          })}
        </div>

        <div className="w-[calc(100%-64px)] h-px bg-muted-black/30 inline-block my-8 mx-auto" />

        <h1 className="text-2xl tracking-tight font-jost">Products</h1>
        <div className="mt-4 flex gap-4">
          {products.map((project) => (
            <Link key={project.slug} href={`/projects/${project.slug}`}>
              <div className="flex flex-col w-full group">
                {project.icon ? (
                  <Image
                    src={project.icon}
                    alt={`${project.name} logo`}
                    width={100}
                    height={100}
                    className="bg-overlay p-2 rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
                <h2 className="text-lg tracking-tight cursor-pointer pt-2 text-center group-hover:text-accent transition-colors">
                  {project.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>

        <div className="w-[calc(100%-64px)] h-px bg-muted-black/30 inline-block my-8 mx-auto" />

        <h1 className="text-2xl tracking-tight font-jost">Everything else</h1>
        <ul className="mt-4 space-y-2">
          {projects
            .filter((project) => project.category === "plugin")
            .map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex items-baseline justify-between gap-4 text-sm hover:text-accent transition-colors"
                >
                  <span>{project.name}</span>
                  <span className="text-xs text-muted-black group-hover:text-accent">
                    {project.milestone}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
