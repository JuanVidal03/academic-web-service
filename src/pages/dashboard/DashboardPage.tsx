import { AppShell } from "@/components/app-shell";
import { PredictionsChart } from "@/components/predictions-chart";
import { RiskBadge } from "@/components/risk-badge";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatsOverview } from "@/hooks/use-stats";
import { formatPercent } from "@/shared/helpers/student.helper";
import type { RiskLevel } from "@/shared/types/prediction.types";

const DashboardPage = () => {
  const { data: stats } = useStatsOverview();

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold">Panel</h1>
        <p className="text-sm text-muted-foreground">
          Resumen del modelo desplegado y de la actividad de predicción.
        </p>
      </div>

      <StatsCards stats={stats} />
      <PredictionsChart stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por riesgo</CardTitle>
            <CardDescription>Bandas asignadas a las predicciones registradas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats?.byRisk.length ? (
              stats.byRisk.map((band) => (
                <div key={band.riesgo} className="flex items-center gap-3">
                  <RiskBadge riesgo={band.riesgo as RiskLevel} />
                  <span className="tabular-nums">{band.count}</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {stats.totalPredictions > 0
                      ? formatPercent(band.count / stats.totalPredictions)
                      : "—"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin predicciones todavía.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variables más influyentes</CardTitle>
            <CardDescription>
              Caída de ROC-AUC al permutar cada variable sobre datos no vistos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats?.topFeatures.length ? (
              stats.topFeatures.map((feature) => (
                <div key={feature.feature} className="flex items-center gap-3 text-sm">
                  <span className="font-medium">{feature.feature}</span>
                  <span className="ml-auto tabular-nums text-muted-foreground">
                    {feature.importance.toFixed(4)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Ejecuta el análisis para ver estas cifras.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Conjunto de entrenamiento: {stats?.trainingRecords.toLocaleString("es-CO") ?? "—"}{" "}
        registros, tasa de deserción{" "}
        {stats ? formatPercent(stats.trainingDropoutRate) : "—"}.
      </p>
    </AppShell>
  );
};

export default DashboardPage;
