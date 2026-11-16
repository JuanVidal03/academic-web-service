import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/shared/helpers/student.helper";
import type { StatsOverview } from "@/shared/types/prediction.types";

/** Replaces the static section-cards demo with figures from /stats/overview. */
export function StatsCards ({ stats }: { stats: StatsOverview | undefined }) {
  if (stats === undefined) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((card) => (
          <Skeleton key={card} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const highRisk = stats.byRisk.find((band) => band.riesgo === "alto")?.count ?? 0;
  const items = [
    { label: "Predicciones realizadas", value: stats.totalPredictions.toLocaleString("es-CO") },
    { label: "Marcadas en riesgo", value: formatPercent(stats.flaggedShare) },
    { label: "Riesgo alto", value: highRisk.toLocaleString("es-CO") },
    {
      // As a percentage: "0.7695" reads like a score out of one, not a proportion.
      label: `ROC-AUC (${stats.modelName ?? "sin modelo"})`,
      value: stats.modelRocAuc !== null ? formatPercent(stats.modelRocAuc) : "—"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
