/* eslint-disable camelcase -- snake_case keys are the subject of this file: these are the
   API's own field names, and rewriting them in camelCase would test nothing. */
import { describe, expect, it } from "vitest";

import { toCamel, toSnake } from "@/shared/helpers/case.helper";

describe("case conversion", () => {
  it("round-trips every awkward feature name", () => {
    // The names most likely to break a naive converter: trailing unit, single-letter
    // segment, and a long chain.
    const snake = {
      distancia_a_universidad_km: 5,
      numero_materias_con_perdida_historica: 2,
      area_materia_critica: null,
      n_features: 34,
      roc_auc_mean: 0.774
    };

    const camel = toCamel<Record<string, unknown>>(snake);
    expect(Object.keys(camel)).toEqual([
      "distanciaAUniversidadKm",
      "numeroMateriasConPerdidaHistorica",
      "areaMateriaCritica",
      "nFeatures",
      "rocAucMean"
    ]);
    expect(toSnake(camel)).toEqual(snake);
  });

  it("keeps null rather than dropping it", () => {
    // area_materia_critica must reach the API as null, not undefined or "".
    expect(toSnake({ areaMateriaCritica: null })).toEqual({ area_materia_critica: null });
  });

  it("converts keys inside arrays and nested objects", () => {
    const converted = toCamel<{ models: { is_best: boolean; cv_metrics: { roc_auc_mean: number } }[] }>(
      { models: [{ is_best: true, cv_metrics: { roc_auc_mean: 0.77 } }] }
    );
    expect(converted.models[0].isBest).toBe(true);
    expect(converted.models[0].cvMetrics.rocAucMean).toBe(0.77);
  });

  it("leaves values alone", () => {
    expect(toCamel<{ someKey: string }>({ some_key: "No_Touching_This" }).someKey).toBe(
      "No_Touching_This"
    );
  });
});
