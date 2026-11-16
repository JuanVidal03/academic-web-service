import { describe, expect, it } from "vitest";

import { toSnake } from "@/shared/helpers/case.helper";
import {
  EXAMPLE_STUDENT,
  SIN_AREA,
  toStudent,
  toValues
} from "@/shared/helpers/student.helper";

describe("form value mapping", () => {
  it("round-trips the example student", () => {
    expect(toStudent(toValues(EXAMPLE_STUDENT))).toEqual(EXAMPLE_STUDENT);
  });

  it("maps the no-critical-area sentinel to null", () => {
    // The contract that matters most. The pipeline fills missing categories itself; a
    // sentinel string or "" would reach the encoder as an unseen category and be turned
    // into an all-zero row, silently changing the prediction for ~50% of students.
    const values = { ...toValues(EXAMPLE_STUDENT), areaMateriaCritica: SIN_AREA };
    expect(toStudent(values).areaMateriaCritica).toBeNull();
  });

  it("maps an empty area to null as well", () => {
    const values = { ...toValues(EXAMPLE_STUDENT), areaMateriaCritica: "" };
    expect(toStudent(values).areaMateriaCritica).toBeNull();
  });

  it("keeps a real area as its string", () => {
    const values = { ...toValues(EXAMPLE_STUDENT), areaMateriaCritica: "Salud" };
    expect(toStudent(values).areaMateriaCritica).toBe("Salud");
  });

  it("survives the trip to the wire as null, not a missing key", () => {
    // toSnake must preserve the null; dropping it would make the API apply its own
    // default for a *required* field and 422.
    const values = { ...toValues(EXAMPLE_STUDENT), areaMateriaCritica: SIN_AREA };
    const payload = toSnake<Record<string, unknown>>(toStudent(values));
    expect("area_materia_critica" in payload).toBe(true);
    expect(payload.area_materia_critica).toBeNull();
  });

  it("converts every numeric field to a number", () => {
    const student = toStudent(toValues(EXAMPLE_STUDENT));
    for (const key of [
      "semestre",
      "notaPromedio",
      "porcentajeAsistencia",
      "ingresoFamiliar",
      "distanciaAUniversidadKm"
    ] as const) {
      expect(typeof student[key]).toBe("number");
    }
  });

  it("turns a blank numeric field into NaN so validation can catch it", () => {
    // Not 0: an empty age is unknown, and silently sending 0 would be a plausible-looking
    // wrong answer.
    const values = { ...toValues(EXAMPLE_STUDENT), edad: "" };
    expect(Number.isNaN(toStudent(values).edad)).toBe(true);
  });
});
