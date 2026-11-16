import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PredictionForm } from "@/components/prediction-form";
import { EXAMPLE_STUDENT } from "@/shared/helpers/student.helper";
import type { StudentFeatures } from "@/shared/types/prediction.types";

afterEach(cleanup);

const submit = (screen: ReturnType<typeof render>) =>
  fireEvent.click(screen.getByRole("button", { name: "Calcular riesgo" }));

describe("PredictionForm", () => {
  it("submits the prefilled example without any editing", () => {
    // The prefill is the whole point: a prediction must be one click away.
    const onSubmit = vi.fn();
    const screen = render(<PredictionForm onSubmit={onSubmit} isPending={false} />);

    submit(screen);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const student = onSubmit.mock.calls[0][0] as StudentFeatures;
    expect(student.programa).toBe(EXAMPLE_STUDENT.programa);
    expect(student.notaPromedio).toBe(3.2);
    expect(student.semestre).toBe(3);
  });

  it("sends numbers as numbers, not strings", () => {
    // The API rejects "3.2" for a float field, and the inputs are text under the hood.
    const onSubmit = vi.fn();
    const screen = render(<PredictionForm onSubmit={onSubmit} isPending={false} />);

    fireEvent.change(screen.getByLabelText("Nota promedio (0-5)"), {
      target: { value: "1.5" }
    });
    submit(screen);

    const student = onSubmit.mock.calls[0][0] as StudentFeatures;
    expect(student.notaPromedio).toBe(1.5);
    expect(typeof student.notaPromedio).toBe("number");
  });

  it("omits a blank student code rather than sending an empty string", () => {
    const onSubmit = vi.fn();
    const screen = render(<PredictionForm onSubmit={onSubmit} isPending={false} />);

    submit(screen);

    const student = onSubmit.mock.calls[0][0] as StudentFeatures;
    expect(student.codigo).toBe("");
  });

  it("disables the controls and relabels the button while a prediction runs", () => {
    const screen = render(<PredictionForm onSubmit={vi.fn()} isPending={true} />);

    const button = screen.getByRole("button", { name: "Analizando..." });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByLabelText("Nota promedio (0-5)").hasAttribute("disabled")
    ).toBe(true);
  });

  it("restores the example after editing", () => {
    const onSubmit = vi.fn();
    const screen = render(<PredictionForm onSubmit={onSubmit} isPending={false} />);

    fireEvent.change(screen.getByLabelText("Edad"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Restablecer ejemplo" }));
    submit(screen);

    expect((onSubmit.mock.calls[0][0] as StudentFeatures).edad).toBe(20);
  });
});
