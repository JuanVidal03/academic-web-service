import { describe, expect, it } from "vitest";

import batchSample from "@/shared/samples/batch-sample.json";
import { EXAMPLE_STUDENT, NUMERIC_FIELDS, SAMPLES } from "@/shared/helpers/student.helper";

/** Every field the API requires, taken from the contract the form is built on. */
const REQUIRED = Object.keys(EXAMPLE_STUDENT).filter((key) => key !== "codigo");

describe("sample students", () => {
  it("exposes the four profiles", () => {
    expect(SAMPLES).toHaveLength(4);
  });

  it.each(SAMPLES)("$label carries every required field", ({ student }) => {
    // A sample missing a field would 422 at the API rather than fail here, which is a much
    // worse place to find out.
    for (const field of REQUIRED) {
      expect(student, `missing ${field}`).toHaveProperty(field);
    }
  });

  it.each(SAMPLES)("$label has no extra fields the API would reject", ({ student }) => {
    const allowed = new Set(Object.keys(EXAMPLE_STUDENT));
    for (const key of Object.keys(student)) {
      expect(allowed.has(key), `unexpected field ${key}`).toBe(true);
    }
  });

  it.each(SAMPLES)("$label types its numeric fields as numbers", ({ student }) => {
    const record = student as unknown as Record<string, unknown>;
    for (const field of NUMERIC_FIELDS) {
      expect(typeof record[field], `${field} should be numeric`).toBe("number");
    }
  });

  it("includes one profile with a null critical area", () => {
    // This is the sample that proves the optional-field contract; without it the null path
    // is only covered by a unit test, never by something a person can click.
    const nulls = SAMPLES.filter((s) => s.student.areaMateriaCritica === null);
    expect(nulls.length).toBeGreaterThanOrEqual(1);
  });

  it("ships a batch file that respects the API's 100-student cap", () => {
    expect(Array.isArray(batchSample)).toBe(true);
    expect(batchSample.length).toBeGreaterThan(1);
    expect(batchSample.length).toBeLessThanOrEqual(100);
  });
});
