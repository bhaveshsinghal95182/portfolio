import DownloadsChart from "@/components/downloads-chart";
import { type ChartConfig } from "@/components/ui/chart";
import Link from "next/link";
import Image from "next/image";

export interface DownloadsData {
  downloads: number;
  day: string;
}

function condenseToMonthly(data: DownloadsData[]) {
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
async function getDownloadsHistory(
  packageName: string,
  startingDate: string,
): Promise<DownloadsData[]> {
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
    return [];
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
} satisfies ChartConfig;

const saasApps = [
  { name: "Recso", link: "https://recso.dev", icon: "https://recso.dev/R.png" },
  {
    name: "Messy UI",
    link: "https://messyui.dev",
    icon: "https://messyui.dev/favicon_io/android-chrome-192x192.png",
  },
];

export default async function Page() {
  const kickstartRaw = await getDownloadsHistory(
    "kickstart-express",
    "2025-07-28",
  );
  const logosRaw = await getDownloadsHistory("company-logos", "2025-08-21");
  const kickstartData = condenseToMonthly(kickstartRaw);
  const logosData = condenseToMonthly(logosRaw);
  const npmPackages = [
    {
      title: "Kickstart Express",
      data: kickstartData,
      config: kickstartConfig,
      link: "https://www.npmjs.com/package/kickstart-express",
    },
    {
      title: "Company logos",
      data: logosData,
      config: logosConfig,
      link: "https://www.npmjs.com/package/company-logos",
    },
  ];
  return (
    <div className="font-mono">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl tracking-tight font-jost">Npm packages</h1>
        <div className="flex w-full">
          {npmPackages.map((item, index) => (
            <div key={index} className="w-full">
              <DownloadsChart chartData={item.data} chartConfig={item.config} />
              <Link href={item.link}>
                <h2 className="text-lg tracking-tight group relative inline-block cursor-pointer">
                  {item.title}
                  <span className="absolute left-0 bottom-0 h-px w-0 bg-current transition-all duration-300 ease-out group-hover:w-full"></span>
                </h2>
              </Link>
            </div>
          ))}
        </div>
        <div className="w-[calc(100%-64px)] h-px bg-black inline-block my-8 mx-auto" />
        <h1 className="text-2xl tracking-tight font-jost">SAAS</h1>
        <div className="mt-4 flex gap-4">
          {saasApps.map((item) => (
            <Link key={item.name} href={item.link} target="_blank">
              <div className="flex flex-col w-full">
                <Image
                  src={item.icon}
                  alt={`${item.name} logo`}
                  width={100}
                  height={100}
                  className="bg-black p-2 rounded-xl"
                />
                <h2 className="text-lg tracking-tight group relative inline-block cursor-pointer pt-2 text-center">
                  {item.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
