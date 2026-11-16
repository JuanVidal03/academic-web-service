import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * One model metric, shown as a percentage with the raw value beside it.
 *
 * Metrics were previously printed as bare decimals ("0.7695"), which reads as a score out
 * of one rather than a proportion. The percentage is the number people actually reason
 * about; the decimal stays visible because that is what the API returns and what you would
 * compare against a report.
 */
export function MetricTile ({
  label,
  value,
  hint
}: {
  label: string;
  value: number | null | undefined;
  hint?: string;
}) {
  const known = typeof value === "number" && Number.isFinite(value);

  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="flex items-baseline gap-2 text-2xl tabular-nums">
          {known ? `${(value * 100).toFixed(1)}%` : "—"}
          {known ? (
            <span className="text-xs font-normal text-muted-foreground">
              {value.toFixed(4)}
            </span>
          ) : null}
        </CardTitle>
        {hint ? <CardDescription className="text-xs">{hint}</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}

/** Percentage for a table cell: compact, no card. */
export const asPercent = (value: number | null | undefined): string =>
  typeof value === "number" && Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "—";
