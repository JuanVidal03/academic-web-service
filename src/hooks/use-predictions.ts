import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listPredictions,
  predictBatchCompare,
  predictCompare
} from "@/shared/api/predictions.api";
import type { StudentFeatures } from "@/shared/types/prediction.types";

/**
 * Ask every stored algorithm about one student.
 *
 * A mutation rather than a query: it is an explicit action with a body, and caching it by
 * key would mean a changed field silently returned a stale verdict.
 */
export const useComparePrediction = () =>
  useMutation({
    mutationFn: (student: StudentFeatures) => predictCompare(student),
    onError: () => {
      toast.error("No se pudo calcular la predicción. Revisa los datos e intenta de nuevo.");
    }
  });

/**
 * Every algorithm's verdict for a whole batch.
 *
 * One request, not one per student: each candidate predicts the batch in a single
 * vectorised pass server-side.
 */
export const useBatchComparePrediction = () =>
  useMutation({
    mutationFn: (students: StudentFeatures[]) => predictBatchCompare(students),
    onError: () => {
      toast.error("No se pudo procesar el lote.");
    }
  });

export const usePredictionHistory = (page: number, pageSize = 20) =>
  useQuery({
    queryKey: ["predictions", page, pageSize],
    queryFn: () => listPredictions(page, pageSize)
  });
