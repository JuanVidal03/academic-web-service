import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BatchResults } from "@/components/batch-results";
import type { ComparePredictionResponse, ModelPrediction } from "@/shared/types/prediction.types";

const model = (
  algorithm: string,
  probabilidad: number,
  decisionThreshold: number,
  isBest: boolean
): ModelPrediction => ({
  algorithm,
  isBest,
  probabilidad,
  deserta: probabilidad >= decisionThreshold,
  riesgo: probabilidad >= 0.6 ? "alto" : probabilidad >= 0.3 ? "medio" : "bajo",
  decisionThreshold,
  cvMetrics: { rocAucMean: 0.7741 },
  testMetrics: { rocAuc: 0.7695, recall: 0.8631, precision: 0.5835 }
});

/** Two students: the first unanimous, the second one the models split on. */
const comparison = (probability: number): ComparePredictionResponse => ({
  bestAlgorithm: "LogisticRegression",
  models: [
    model("LogisticRegression", probability, 0.3025, true),
    model("SVM", probability, 0.2963, false),
    model("HistGradientBoosting", probability, 0.2030, false)
  ]
});

const UNANIMOUS = comparison(0.0265);
const SPLIT = comparison(0.2186);
const BATCH = [UNANIMOUS, SPLIT];

afterEach(cleanup);

describe("BatchResults", () => {
  it("lists every student in the submitted order", () => {
    const screen = render(<BatchResults comparisons={BATCH} />);

    // 2.6%, not 2.7%: toFixed(1) on 2.65 rounds down in binary floating point.
    expect(screen.getByTestId("batch-row-0").textContent).toContain("2.6%");
    expect(screen.getByTestId("batch-row-1").textContent).toContain("21.9%");
  });

  it("shows the first student's full comparison by default", () => {
    const screen = render(<BatchResults comparisons={BATCH} />);

    // The same five-model panel the single-prediction page renders.
    expect(screen.getByTestId("model-row-LogisticRegression")).toBeTruthy();
    expect(screen.getByTestId("model-row-SVM")).toBeTruthy();
    expect(screen.getByText(/Estudiante/).textContent).toContain("#1");
  });

  it("swaps the detail panel when another student is selected", () => {
    const screen = render(<BatchResults comparisons={BATCH} />);

    fireEvent.click(screen.getByTestId("batch-row-1"));

    expect(screen.getByText(/Estudiante/).textContent).toContain("#2");
    // The detail panel now shows the second student's probability, not the first's.
    const headline = screen.getByTestId("model-row-LogisticRegression");
    expect(headline.textContent).toContain("21.9%");
    expect(headline.textContent).not.toContain("2.7%");
  });

  it("marks the selected row", () => {
    const screen = render(<BatchResults comparisons={BATCH} />);

    expect(screen.getByTestId("batch-row-0").getAttribute("aria-current")).toBe("true");

    fireEvent.click(screen.getByTestId("batch-row-1"));

    expect(screen.getByTestId("batch-row-1").getAttribute("aria-current")).toBe("true");
    expect(screen.getByTestId("batch-row-0").getAttribute("aria-current")).toBe("false");
  });

  it("flags rows where the algorithms disagree, and only those", () => {
    // This is the signal that makes a row worth opening; the unanimous row must stay quiet.
    const screen = render(<BatchResults comparisons={BATCH} />);

    expect(screen.getByTestId("batch-row-0").textContent).not.toContain("discrepan");
    // Only HistGradientBoosting's threshold (0.2030) sits below 0.2186.
    expect(screen.getByTestId("batch-row-1").textContent).toContain("1 de 3 modelos discrepan");
  });

  it("renders nothing for an empty batch rather than crashing", () => {
    const screen = render(<BatchResults comparisons={[]} />);
    expect(screen.queryByTestId("batch-row-0")).toBeNull();
  });
});
