import { npmProjects, projects, type Project } from "@/lib/projects";
import { site } from "@/lib/site";
import {
  fetchGithubSummary,
  fetchPackageStats,
  formatCompact,
  type MonthlyDownloads,
} from "@/lib/stats";

export interface ProjectWithStats extends Project {
  /** Live milestone if the APIs answered, static copy otherwise. */
  milestone: string;
  weeklyDownloads: number | null;
  stars: number | null;
}

export interface SiteStats {
  totalDownloads: number | null;
  weeklyDownloads: number | null;
  stars: number | null;
  publicRepos: number | null;
}

export interface PackageChartData {
  project: Project;
  monthly: MonthlyDownloads[];
  weekly: number | null;
  total: number;
}

/**
 * Everything the home page needs, in one pass: one GitHub call plus one npm
 * call per package. All of it is revalidated daily by the fetch layer.
 */
export async function getPortfolioData(): Promise<{
  projects: ProjectWithStats[];
  stats: SiteStats;
  packages: PackageChartData[];
}> {
  const [github, packageStats] = await Promise.all([
    fetchGithubSummary(site.githubUser),
    Promise.all(
      npmProjects.map((project) =>
        fetchPackageStats(project.npmPackage, project.npmSince),
      ),
    ),
  ]);

  const statsByPackage = new Map(
    packageStats.map((stats) => [stats.packageName, stats]),
  );

  const withStats: ProjectWithStats[] = projects.map((project) => {
    const npm = project.npmPackage
      ? statsByPackage.get(project.npmPackage)
      : undefined;
    const stars = project.githubRepo
      ? (github.starsByRepo.get(project.githubRepo) ?? null)
      : null;

    // All-time downloads rather than this week's: a single quiet week should
    // not shrink the headline number on the home page.
    let milestone = project.fallbackMilestone;
    if (npm?.total) {
      milestone = `${formatCompact(npm.total)} downloads`;
    } else if (stars && stars > 1) {
      milestone = `${stars} stars on GitHub`;
    }

    return {
      ...project,
      milestone,
      weeklyDownloads: npm?.weekly ?? null,
      stars,
    };
  });

  const totalDownloads = packageStats.reduce(
    (sum, stats) => sum + stats.total,
    0,
  );
  const weeklyTotal = packageStats.reduce(
    (sum, stats) => sum + (stats.weekly ?? 0),
    0,
  );

  return {
    projects: withStats,
    stats: {
      totalDownloads: totalDownloads || null,
      weeklyDownloads: weeklyTotal || null,
      stars: github.stars,
      publicRepos: github.publicRepos,
    },
    packages: npmProjects.map((project) => {
      const stats = statsByPackage.get(project.npmPackage);
      return {
        project,
        monthly: stats?.monthly ?? [],
        weekly: stats?.weekly ?? null,
        total: stats?.total ?? 0,
      };
    }),
  };
}
