import { api } from "@/shared/api/client";
import { toCamel } from "@/shared/helpers/case.helper";
import type { StatsOverview } from "@/shared/types/prediction.types";

export const getStatsOverview = async (): Promise<StatsOverview> => {
  const { data } = await api.get("/stats/overview");
  return toCamel<StatsOverview>(data);
};
