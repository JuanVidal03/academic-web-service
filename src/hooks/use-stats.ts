import { useQuery } from "@tanstack/react-query";

import { getStatsOverview } from "@/shared/api/stats.api";

export const useStatsOverview = () =>
  useQuery({
    queryKey: ["stats-overview"],
    queryFn: getStatsOverview,
    staleTime: 60 * 1000
  });
