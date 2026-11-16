import { useState } from "react";
import { isAxiosError } from "axios";

import { AppShell } from "@/components/app-shell";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
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
import { usePredictionHistory } from "@/hooks/use-predictions";
import { formatPercent } from "@/shared/helpers/student.helper";

const HistoryPage = () => {
  const [page, setPage] = useState(1);
  const { data, isPending, error } = usePredictionHistory(page);

  // An adviser reaches this route only by typing the URL; the API answers 403 and the page
  // has to say so rather than render an error boundary.
  const forbidden = isAxiosError(error) && error.response?.status === 403;

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold">Historial de predicciones</h1>
        <p className="text-sm text-muted-foreground">
          Registro de auditoría, de la más reciente a la más antigua.
        </p>
      </div>

      {forbidden ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sin permisos</CardTitle>
            <CardDescription>
              El historial completo contiene datos de todos los estudiantes, por lo que solo
              está disponible para administradores.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {isPending && !forbidden ? <Skeleton className="h-64 w-full" /> : null}

      {data ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{data.total} predicciones</CardTitle>
            <CardDescription>
              Página {data.page} de {Math.max(data.pages, 1)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Probabilidad</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Veredicto</TableHead>
                  <TableHead>Estudiante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="tabular-nums">{item.id}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleString("es-CO")}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPercent(item.probabilidad)}
                    </TableCell>
                    <TableCell>
                      <RiskBadge riesgo={item.riesgo} />
                    </TableCell>
                    <TableCell>{item.deserta ? "Deserta" : "No deserta"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.studentId ?? "sin vincular"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={page >= data.pages}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
};

export default HistoryPage;
