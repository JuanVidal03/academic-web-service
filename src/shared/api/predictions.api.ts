import { api } from "@/shared/api/client";
import { toCamel, toSnake } from "@/shared/helpers/case.helper";
import type {
  BatchComparePredictionResponse,
  ComparePredictionResponse,
  PaginatedPredictions,
  PredictionResult,
  StudentFeatures
} from "@/shared/types/prediction.types";

/** Strips the UI-only student code when it is blank, so the API sees null, not "". */
const toPayload = (student: StudentFeatures) => {
  const payload = toSnake<Record<string, unknown>>(student);
  if (payload.codigo === "" || payload.codigo === undefined) {
    delete payload.codigo;
  }
  return payload;
};

export const predict = async (student: StudentFeatures): Promise<PredictionResult> => {
  const { data } = await api.post("/predict", toPayload(student));
  return toCamel<PredictionResult>(data);
};

/** Every stored algorithm's verdict for one student, best first. */
export const predictCompare = async (
  student: StudentFeatures
): Promise<ComparePredictionResponse> => {
  const { data } = await api.post("/predict/compare", toPayload(student));
  return toCamel<ComparePredictionResponse>(data);
};

/** Every stored algorithm's verdict for each student, in submitted order. */
export const predictBatchCompare = async (
  students: StudentFeatures[]
): Promise<BatchComparePredictionResponse> => {
  const { data } = await api.post("/predict/batch/compare", {
    students: students.map(toPayload)
  });
  return toCamel<BatchComparePredictionResponse>(data);
};

export const listPredictions = async (
  page: number,
  pageSize: number
): Promise<PaginatedPredictions> => {
  // Through the converter rather than a snake_case literal, so the query parameters
  // follow the same rule as every request body.
  const { data } = await api.get("/predictions", { params: toSnake({ page, pageSize }) });
  return toCamel<PaginatedPredictions>(data);
};
