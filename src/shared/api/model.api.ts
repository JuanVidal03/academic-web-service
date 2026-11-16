import { api } from "@/shared/api/client";
import { toCamel } from "@/shared/helpers/case.helper";
import type { ModelInfo } from "@/shared/types/prediction.types";

export const getModelInfo = async (): Promise<ModelInfo> => {
  const { data } = await api.get("/model/info");
  return toCamel<ModelInfo>(data);
};
