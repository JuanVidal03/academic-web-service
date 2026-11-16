import { useState } from "react";

import { PredictionResult } from "@/components/prediction-result";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/shared/helpers/student.helper";
import type { ComparePredictionResponse } from "@/shared/types/prediction.types";

/** The deployed model's answer for a comparison, which is what the list rows show. */
export const bestOf = (comparison: ComparePredictionResponse) =>
  comparison.models.find((model) => model.isBest) ?? comparison.models[0];

/** How many algorithms disagree with the deployed one -- the reason to open a row. */
export const disagreementCount = (comparison: ComparePredictionResponse) => {
  const best = bestOf(comparison);
  return comparison.models.filter((model) => model.deserta !== best.deserta).length;
};

/**
 * A batch's results as master-detail.
 *
 * Reuses `PredictionResult` unchanged for the selected student, rather than repeating five
 * model cards for every row: a hundred students would be unreadable. The list carries the
 * deployed verdict so the batch can be scanned, and the detail panel is exactly what the
 * single-prediction page shows.
 */
export function BatchResults ({
  comparisons
}: {
  comparisons: ComparePredictionResponse[];
}) {
  const [selected, setSelected] = useState(0);
  // Clamped rather than synced through an effect: a shorter batch must not leave the detail
  // panel pointing past the end of the list, and a derived value cannot go stale.
  const index = selected < comparisons.length ? selected : 0;
  const current = comparisons[index];

  if (current === undefined) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Resultados</CardTitle>
          <CardDescription>
            Orden de envío. Selecciona un estudiante para ver los cinco modelos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
          {comparisons.map((comparison, position) => {
            const best = bestOf(comparison);
            const splits = disagreementCount(comparison);
            const isSelected = position === index;
            return (
              <button
                key={position}
                type="button"
                data-testid={`batch-row-${position}`}
                aria-current={isSelected}
                onClick={() => setSelected(position)}
                className={
                  isSelected
                    ? "flex flex-col gap-1 rounded-md border border-primary bg-primary/5 p-3 text-left"
                    : "flex flex-col gap-1 rounded-md border p-3 text-left hover:bg-muted/50"
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    #{position + 1}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatPercent(best.probabilidad)}
                  </span>
                  <RiskBadge riesgo={best.riesgo} />
                  <span className="ml-auto text-xs text-muted-foreground">
                    {best.deserta ? "Deserta" : "No deserta"}
                  </span>
                </div>
                {splits > 0 ? (
                  <Badge variant="outline" className="w-fit text-xs">
                    {splits} de {comparison.models.length} modelos discrepan
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          Estudiante <strong>#{index + 1}</strong> de {comparisons.length}
        </p>
        <PredictionResult result={current} />
      </div>
    </div>
  );
}
