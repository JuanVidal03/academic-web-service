import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { asPercent, MetricTile } from "@/components/metric-tile";
import { useModelInfo } from "@/hooks/use-model";

const ModelPage = () => {
  const { data, isPending, isError } = useModelInfo();

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold">Modelo desplegado</h1>
        <p className="text-sm text-muted-foreground">
          Qué algoritmo está en servicio, cómo se calibró y cómo compitió con los demás.
        </p>
      </div>

      {isPending ? <Skeleton className="h-64 w-full" /> : null}
      {isError ? (
        <p className="text-sm text-muted-foreground">No se pudo cargar la información.</p>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="Recall (sensibilidad)"
              value={data.testMetrics.recall}
              hint="De los estudiantes que sí desertaron, qué porción detectamos."
            />
            <MetricTile
              label="Precisión"
              value={data.testMetrics.precision}
              hint="De los que marcamos, qué porción realmente desertó."
            />
            <MetricTile
              label="F1"
              value={data.testMetrics.f1}
              hint="Balance entre recall y precisión."
            />
            <MetricTile
              label="ROC-AUC"
              value={data.testMetrics.rocAuc}
              hint="Capacidad de ordenar por riesgo, independiente del umbral."
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cómo leer estas cifras</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                El sistema está calibrado para <strong>recall</strong>: el umbral de{" "}
                {data.decisionThreshold.toFixed(4)} se eligió como el más alto que aún
                alcanza el objetivo configurado, porque dejar pasar a un estudiante en
                riesgo cuesta más que revisar a uno que no lo estaba.
              </p>
              <p>
                Esa elección tiene un precio: con una precisión de{" "}
                {asPercent(data.testMetrics.precision)}, cerca de{" "}
                {asPercent(1 - (data.testMetrics.precision ?? 0))} de los estudiantes
                marcados no habrían desertado. Son revisiones de más, no errores del
                sistema.
              </p>
              <p>
                <strong>ROC-AUC no depende del umbral</strong> y mide cuánto separa el
                modelo a quienes desertan de quienes no. Es la cifra que indica el techo de
                lo que estos datos permiten: subir recall no la mueve.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Algoritmo desplegado</CardDescription>
                <CardTitle className="text-lg">{data.modelName}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Umbral de decisión</CardDescription>
                <CardTitle className="text-lg tabular-nums">
                  {data.decisionThreshold.toFixed(4)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Variables</CardDescription>
                <CardTitle className="text-lg tabular-nums">{data.nFeatures}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparación de algoritmos</CardTitle>
              <CardDescription>
                Validación cruzada sobre el conjunto de entrenamiento. El mejor ROC-AUC
                determina qué modelo se despliega.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Algoritmo</TableHead>
                    <TableHead className="text-right">ROC-AUC</TableHead>
                    <TableHead className="text-right">F1</TableHead>
                    <TableHead className="text-right">Recall</TableHead>
                    <TableHead className="text-right">Exactitud</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.comparison.map((row) => (
                    <TableRow key={row.model}>
                      <TableCell className="font-medium">
                        {row.model}
                        {row.model === data.modelName ? (
                          <Badge className="ml-2">Desplegado</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {asPercent(row.rocAucMean)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {asPercent(row.f1Mean)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {asPercent(row.recallMean)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {asPercent(row.accuracyMean)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bandas de riesgo</CardTitle>
              <CardDescription>
                Una decisión institucional, no un resultado estadístico.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-sm">
              {Object.entries(data.riskBands).map(([band, [from, to]]) => (
                <span key={band}>
                  <strong className="capitalize">{band}</strong>: {(from * 100).toFixed(0)}% –{" "}
                  {(to * 100).toFixed(0)}%
                </span>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </AppShell>
  );
};

export default ModelPage;
