import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { asPercent } from "@/components/metric-tile";
import { formatPercent, RISK_GUIDANCE } from "@/shared/helpers/student.helper";
import type { ComparePredictionResponse } from "@/shared/types/prediction.types";

/**
 * The loader, shaped like the result it replaces so the layout does not jump when the
 * five models come back.
 */
export function PredictionResultSkeleton () {
  return (
    <div className="flex flex-col gap-4" data-testid="prediction-loading">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-32" />
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function PredictionResult ({ result }: { result: ComparePredictionResponse }) {
  const best = result.models.find((model) => model.isBest) ?? result.models[0];
  const disagreeing = result.models.filter((model) => model.deserta !== best.deserta).length;

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-primary/40">
        <CardHeader>
          <CardDescription>Veredicto del modelo desplegado · {best.algorithm}</CardDescription>
          <CardTitle className="flex flex-wrap items-center gap-3 text-3xl">
            {formatPercent(best.probabilidad)}
            <RiskBadge riesgo={best.riesgo} />
          </CardTitle>
          <CardDescription>
            {best.deserta
              ? "Clasificado como en riesgo de desercion."
              : "No clasificado como en riesgo de desercion."}{" "}
            {RISK_GUIDANCE[best.riesgo]}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Umbral de decisión {best.decisionThreshold.toFixed(4)}: se marca al estudiante
            cuando la probabilidad lo alcanza.
          </p>
          <p className="mt-2">
            Detecta cerca de {asPercent(best.testMetrics.recall as number | undefined)} de
            los estudiantes que sí desertan, y{" "}
            {asPercent(best.testMetrics.precision as number | undefined)} de los que marca
            lo hacen realmente. Sirve para priorizar a quién contactar, no para decidir
            sobre un estudiante.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparación de modelos</CardTitle>
          <CardDescription>
            Los cinco algoritmos evaluados responden sobre este estudiante.
            {disagreeing > 0
              ? ` ${disagreeing} discrepa${disagreeing === 1 ? "" : "n"} del modelo desplegado.`
              : " Todos coinciden."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {result.models.map((model) => (
            <div
              key={model.algorithm}
              data-testid={`model-row-${model.algorithm}`}
              className={
                model.isBest
                  ? "flex flex-wrap items-center gap-3 rounded-md border border-primary/50 bg-primary/5 p-3"
                  : "flex flex-wrap items-center gap-3 rounded-md border p-3"
              }
            >
              <span className="min-w-44 font-medium">{model.algorithm}</span>
              {model.isBest ? <Badge>Mejor modelo</Badge> : null}
              <span className="tabular-nums">{formatPercent(model.probabilidad)}</span>
              <RiskBadge riesgo={model.riesgo} />
              <span className="text-sm text-muted-foreground">
                {model.deserta ? "Deserta" : "No deserta"}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                umbral {model.decisionThreshold.toFixed(4)} · ROC-AUC{" "}
                {asPercent(model.cvMetrics.rocAucMean as number | undefined)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Cada modelo aplica su propio umbral. Dos modelos pueden dar probabilidades parecidas
        y veredictos distintos porque se calibraron por separado.
      </p>
    </div>
  );
}
