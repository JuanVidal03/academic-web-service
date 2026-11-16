import { Badge } from "@/components/ui/badge";
import { RISK_LABELS } from "@/shared/helpers/student.helper";
import type { RiskLevel } from "@/shared/types/prediction.types";

const VARIANT: Record<RiskLevel, string> = {
  bajo: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medio: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  alto: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
};

export function RiskBadge ({ riesgo }: { riesgo: RiskLevel }) {
  return (
    <Badge variant="outline" className={VARIANT[riesgo]}>
      {RISK_LABELS[riesgo] ?? riesgo}
    </Badge>
  );
}
