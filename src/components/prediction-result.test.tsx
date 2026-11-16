import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PredictionResult, PredictionResultSkeleton } from "@/components/prediction-result";
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
  cvMetrics: { rocAucMean: isBest ? 0.7741 : 0.7573 },
  testMetrics: { rocAuc: 0.7695 }
});

/** Mirrors the real response, including the genuine disagreement the API produces. */
const RESULT: ComparePredictionResponse = {
  bestAlgorithm: "LogisticRegression",
  models: [
    model("LogisticRegression", 0.2289, 0.3505, true),
    model("SVM", 0.1898, 0.3407, false),
    model("GradientBoosting", 0.3515, 0.3355, false),
    model("RandomForest", 0.26, 0.38, false),
    model("HistGradientBoosting", 0.2464, 0.2504, false)
  ]
};

afterEach(cleanup);

describe("PredictionResult", () => {
  it("renders every model", () => {
    const screen = render(<PredictionResult result={RESULT} />);
    for (const entry of RESULT.models) {
      expect(screen.getByTestId(`model-row-${entry.algorithm}`)).toBeTruthy();
    }
  });

  it("marks the best model, lists it first, and headlines its verdict", () => {
    const screen = render(<PredictionResult result={RESULT} />);

    expect(screen.getByText("Mejor modelo")).toBeTruthy();
    // Scoped to the headline: the name and percentage also appear in the row below, so a
    // document-wide query would be ambiguous.
    expect(
      screen.getByText(/Veredicto del modelo desplegado · LogisticRegression/)
    ).toBeTruthy();

    const rows = screen.getAllByTestId(/^model-row-/);
    expect(rows[0].getAttribute("data-testid")).toBe("model-row-LogisticRegression");
    expect(rows[0].textContent).toContain("22.9%");
    expect(rows[0].textContent).toContain("No deserta");
  });

  it("marks exactly one model as best", () => {
    const screen = render(<PredictionResult result={RESULT} />);
    expect(screen.queryAllByText("Mejor modelo")).toHaveLength(1);
  });

  it("shows each model's own threshold", () => {
    // Without this the table looks broken: GradientBoosting reports a lower probability
    // than the winner's threshold yet still flags the student, because its own cut-point
    // is lower.
    const screen = render(<PredictionResult result={RESULT} />);
    const row = screen.getByTestId("model-row-GradientBoosting");

    expect(row.textContent).toContain("0.3355");
    expect(row.textContent).toContain("Deserta");
  });

  it("reports how many models disagree with the deployed one", () => {
    const screen = render(<PredictionResult result={RESULT} />);
    // GradientBoosting says deserta; the other four do not.
    expect(screen.getByText(/1 discrepa/)).toBeTruthy();
  });

  it("says so when every model agrees", () => {
    const agreeing: ComparePredictionResponse = {
      bestAlgorithm: "LogisticRegression",
      models: [
        model("LogisticRegression", 0.2289, 0.3505, true),
        model("SVM", 0.1898, 0.3407, false)
      ]
    };
    const screen = render(<PredictionResult result={agreeing} />);
    expect(screen.getByText(/Todos coinciden/)).toBeTruthy();
  });
});

describe("PredictionResultSkeleton", () => {
  it("is what shows while the five models run", () => {
    const screen = render(<PredictionResultSkeleton />);
    expect(screen.getByTestId("prediction-loading")).toBeTruthy();
  });
});
