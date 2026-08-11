/**
 * Live numbers for the site. Every call here is best-effort: the npm and GitHub
 * APIs are unauthenticated and rate-limited, so each fetch swallows its own
 * failure and returns null. Callers fall back to static copy rather than
 * blowing up a page render.
 *
 * Set GITHUB_TOKEN in the environment to lift the GitHub rate limit from
 * 60/hour to 5000/hour.
 */

export interface DownloadPoint {
  day: string;
  downloads: number;
}

export interface MonthlyDownloads {
  month: string;
  downloads: number;
}

/** Refetch once a day — these numbers do not move fast enough to matter. */
const REVALIDATE_SECONDS = 60 * 60 * 24;

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "bhavesh-portfolio",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function getJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * npm caps a downloads range at 18 months, so long histories are stitched
 * together from consecutive windows.
 */
export async function fetchDownloadRange(
  packageName: string,
  startDate: string,
): Promise<DownloadPoint[]> {
  const end = new Date();
  const points: DownloadPoint[] = [];
  let cursor = new Date(startDate);

  while (cursor < end) {
    const windowEnd = new Date(cursor);
    windowEnd.setMonth(windowEnd.getMonth() + 17);
    const rangeEnd = windowEnd < end ? windowEnd : end;

    const data = await getJson<{ downloads: DownloadPoint[] }>(
      `https://api.npmjs.org/downloads/range/${isoDate(cursor)}:${isoDate(rangeEnd)}/${packageName}`,
    );
    if (data?.downloads) points.push(...data.downloads);

    cursor = new Date(rangeEnd);
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

export function condenseToMonthly(data: DownloadPoint[]): MonthlyDownloads[] {
  const monthly = new Map<string, number>();

  for (const entry of data) {
    const month = new Date(entry.day).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    monthly.set(month, (monthly.get(month) ?? 0) + entry.downloads);
  }

  return Array.from(monthly, ([month, downloads]) => ({ month, downloads }));
}

export async function fetchWeeklyDownloads(
  packageName: string,
): Promise<number | null> {
  const data = await getJson<{ downloads: number }>(
    `https://api.npmjs.org/downloads/point/last-week/${packageName}`,
  );
  return data?.downloads ?? null;
}

interface GithubRepo {
  name: string;
  stargazers_count: number;
  fork: boolean;
}

export async function fetchRepoStars(
  owner: string,
  repo: string,
): Promise<number | null> {
  const data = await getJson<GithubRepo>(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers: githubHeaders() },
  );
  return data?.stargazers_count ?? null;
}

/** One request covers every repo, so per-project star counts are free. */
export async function fetchOwnedRepos(
  user: string,
): Promise<GithubRepo[] | null> {
  return getJson<GithubRepo[]>(
    `https://api.github.com/users/${user}/repos?per_page=100&type=owner&sort=updated`,
    { headers: githubHeaders() },
  );
}

export interface GithubSummary {
  publicRepos: number | null;
  followers: number | null;
  stars: number | null;
  starsByRepo: Map<string, number>;
}

export async function fetchGithubSummary(
  user: string,
): Promise<GithubSummary> {
  const [profile, repos] = await Promise.all([
    getJson<{ public_repos: number; followers: number }>(
      `https://api.github.com/users/${user}`,
      { headers: githubHeaders() },
    ),
    fetchOwnedRepos(user),
  ]);

  return {
    publicRepos: profile?.public_repos ?? null,
    followers: profile?.followers ?? null,
    stars: repos
      ? repos.reduce((total, repo) => total + (repo.stargazers_count ?? 0), 0)
      : null,
    starsByRepo: new Map(
      (repos ?? []).map((repo) => [repo.name, repo.stargazers_count ?? 0]),
    ),
  };
}

export interface PackageStats {
  packageName: string;
  weekly: number | null;
  total: number;
  monthly: MonthlyDownloads[];
}

export async function fetchPackageStats(
  packageName: string,
  startDate: string,
): Promise<PackageStats> {
  const [range, weekly] = await Promise.all([
    fetchDownloadRange(packageName, startDate),
    fetchWeeklyDownloads(packageName),
  ]);

  return {
    packageName,
    weekly,
    total: range.reduce((sum, point) => sum + point.downloads, 0),
    monthly: condenseToMonthly(range),
  };
}

function trimZero(value: string): string {
  return value.replace(/\.0$/, "");
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${trimZero((value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1))}M`;
  }
  if (value >= 1_000) {
    return `${trimZero((value / 1_000).toFixed(value >= 10_000 ? 0 : 1))}k`;
  }
  return String(value);
}
