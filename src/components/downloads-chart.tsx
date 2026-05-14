"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis } from "recharts";

interface MonthlyDownloadsData {
  month: string;
  downloads: number;
}

interface DownloadsChartProps {
  chartData: MonthlyDownloadsData[];
  chartConfig: ChartConfig;
}

export default function DownloadsChart({
  chartData,
  chartConfig,
}: DownloadsChartProps) {
  return (
    <ChartContainer config={chartConfig} className="max-h-40">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 10, left: 12, right: 12 }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" vertical={false} /> */}
        <XAxis dataKey={"month"} axisLine tick={false} tickLine={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey={"downloads"}
          type="monotone"
          stroke="var(--color-downloads)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
