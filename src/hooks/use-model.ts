import { useQuery } from "@tanstack/react-query";

import { getModelInfo } from "@/shared/api/model.api";

export const useModelInfo = () =>
  useQuery({
    queryKey: ["model-info"],
    queryFn: getModelInfo,
    // The deployed model only changes on a retrain, so this is safe to hold on to.
    staleTime: 5 * 60 * 1000
  });
