import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatsOverview } from "@/shared/types/prediction.types";

const config = {
  count: { label: "Predicciones", color: "var(--primary)" }
} satisfies ChartConfig;

/**
 * Predictions per day, replacing the hardcoded chartData in the demo component.
 */
export function PredictionsChart ({ stats }: { stats: StatsOverview | undefined }) {
  if (stats === undefined) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actividad reciente</CardTitle>
        <CardDescription>
          Predicciones por día en los últimos 30 días
          {stats.perDay.length === 0 ? " · aún sin datos" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={stats.perDay}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString("es-CO", { month: "short", day: "numeric" })
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="count"
              type="natural"
              fill="var(--primary)"
              fillOpacity={0.25}
              stroke="var(--primary)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
