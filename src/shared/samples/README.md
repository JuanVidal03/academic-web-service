# Sample students

Each file is one student in the shape `POST /predict/compare` expects (camelCase; the API
layer converts to snake_case). They exist to exercise the model across its range without
retyping 34 fields, and to make disagreement between algorithms visible.

Load one from the **Evaluar estudiante** page ("Cargar ejemplo") or paste
`batch-sample.json` into **Evaluar por lotes**.

## Measured against the deployed model

Values below are the real response, not illustrations. If they drift after a retrain, the
threshold or the winning algorithm changed.

| File | Probability | Band | Models saying *deserta* | What it is for |
|---|---|---|---|---|
| `low-risk.json` | 0.0265 | bajo | **0 of 5** | The clear negative — unanimous. |
| `missing-area.json` | 0.2186 | bajo | **2 of 5** | **Where the models split.** Also proves the optional-field contract. |
| `borderline.json` | 0.5212 | medio | **5 of 5** | Mediocre on every axis, yet unanimous — "borderline probability" is not the same as "models disagree". |
| `high-risk.json` | 0.9939 | alto | **5 of 5** | The clear positive — unanimous. |

Two things worth noticing:

- **`missing-area.json` is the interesting one.** Its probability is low (0.2186) yet two of
  five algorithms still flag it, because their calibrated thresholds sit below the winner's.
  This is the case the comparison view exists to show.
- **`borderline.json` is unanimous despite a mid-range probability.** A 52% probability is
  uncertainty about the *student*, not disagreement between *models*. Useful for explaining
  the difference to anyone reading the screen.

`missing-area.json` sets `areaMateriaCritica: null`. It is identical to the documented
example student otherwise, so its `0.2186075960472946` is the exact value that proves the
null contract end to end — the field must be sent as `null`, never `""` or a placeholder.

These are **synthetic** profiles for exercising the service, not real students.
