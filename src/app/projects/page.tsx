import DownloadsChart from "@/components/downloads-chart";
import { type ChartConfig } from "@/components/ui/chart";

export interface downloadsData {
  downloads: number;
  day: string;
}

function condenseToMonthly(data: downloadsData[]) {
  const monthlyMap = new Map<string, number>();

  for (const entry of data) {
    const date = new Date(entry.day);

    const monthLabel = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    monthlyMap.set(
      monthLabel,
      (monthlyMap.get(monthLabel) ?? 0) + entry.downloads,
    );
  }

  return Array.from(monthlyMap.entries()).map(([month, downloads]) => ({
    month,
    downloads,
  }));
}
async function getWeeklyDownloads(packageName: string, startingDate: string) {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${yyyy}-${mm}-${dd}`;
    const response = await fetch(
      `https://api.npmjs.org/downloads/range/${startingDate}:${formattedDate}/${packageName}`,
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.downloads;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const kickstartConfig = {
  downloads: {
    label: "downloads",
    color: "var(--color-chart-blue)",
  },
} satisfies ChartConfig;

const logosConfig = {
  downloads: {
    label: "downloads",
    color: "var(--color-chart-green)",
  },
};

export default async function Page() {
  const kickstartRaw = await getWeeklyDownloads(
    "kickstart-express",
    "2025-07-28",
  );
  const logosRaw = await getWeeklyDownloads("company-logos", "2025-08-21");
  const kickstartData = condenseToMonthly(kickstartRaw);
  const logosData = condenseToMonthly(logosRaw);
  return (
    <div className="font-mono">
      <div className="flex flex-col w-full">
        <h1>My npm packages</h1>
        <div className="flex w-full">
          <div className="w-full">
            <DownloadsChart
              chartData={kickstartData}
              chartConfig={kickstartConfig}
            />
            kickstart Express
          </div>
          <div className="w-full">
            <DownloadsChart chartData={logosData} chartConfig={logosConfig} />
            Company Logos
          </div>
        </div>
      </div>
    </div>
  );
}
