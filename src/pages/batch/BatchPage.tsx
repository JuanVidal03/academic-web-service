import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { BatchResults, bestOf, disagreementCount } from "@/components/batch-results";
import { PredictionResultSkeleton } from "@/components/prediction-result";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBatchComparePrediction } from "@/hooks/use-predictions";
import batchSample from "@/shared/samples/batch-sample.json";
import { formatPercent } from "@/shared/helpers/student.helper";
import type { StudentFeatures } from "@/shared/types/prediction.types";

const MAX_BATCH = 100;

const BatchPage = () => {
  const [raw, setRaw] = useState(() => JSON.stringify(batchSample, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const { mutate: run, data, isPending } = useBatchComparePrediction();

  const handleRun = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setParseError("El JSON no es válido.");
      return;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      setParseError("Se espera un arreglo con al menos un estudiante.");
      return;
    }
    // Checked here so the cap is immediate feedback rather than a 422 from the API.
    if (parsed.length > MAX_BATCH) {
      setParseError(`El máximo es ${MAX_BATCH} estudiantes por lote (recibidos ${parsed.length}).`);
      return;
    }
    setParseError(null);
    run(parsed as StudentFeatures[]);
  };

  const comparisons = data?.comparisons ?? [];
  const flagged = comparisons.filter((c) => bestOf(c).deserta).length;
  const split = comparisons.filter((c) => disagreementCount(c) > 0).length;

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold">Evaluación por lotes</h1>
        <p className="text-sm text-muted-foreground">
          Hasta {MAX_BATCH} estudiantes en una sola llamada. Cada uno recibe el veredicto de
          los cinco algoritmos, igual que en la evaluación individual.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estudiantes (JSON)</CardTitle>
          <CardDescription>
            Un arreglo de objetos con los mismos campos del formulario individual. Viene
            cargado con los perfiles de <code>src/shared/samples/</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            spellCheck={false}
            rows={12}
            className="w-full rounded-md border bg-transparent p-3 font-mono text-xs"
          />
          {parseError ? <p className="text-sm text-destructive">{parseError}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRun} disabled={isPending}>
              {isPending ? "Analizando..." : "Evaluar lote"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                setRaw(JSON.stringify(batchSample, null, 2));
                setParseError(null);
              }}
            >
              Restablecer ejemplo
            </Button>
          </div>
        </CardContent>
      </Card>

      {isPending ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analizando el lote...</CardTitle>
            </CardHeader>
          </Card>
          <PredictionResultSkeleton />
        </div>
      ) : null}

      {data && comparisons.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { label: "Estudiantes", value: String(data.count) },
              { label: "Marcados en riesgo", value: `${flagged} de ${data.count}` },
              {
                label: "Proporción marcada",
                value: formatPercent(data.count === 0 ? 0 : flagged / data.count)
              },
              { label: "Con modelos divididos", value: `${split} de ${data.count}` }
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardHeader>
                  <CardDescription>{kpi.label}</CardDescription>
                  <CardTitle className="text-xl tabular-nums">{kpi.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <BatchResults comparisons={comparisons} />
        </>
      ) : null}
    </AppShell>
  );
};

export default BatchPage;
