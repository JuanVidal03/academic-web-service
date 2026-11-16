import borderline from "@/shared/samples/borderline.json";
import highRisk from "@/shared/samples/high-risk.json";
import lowRisk from "@/shared/samples/low-risk.json";
import missingArea from "@/shared/samples/missing-area.json";
import type { StudentFeatures } from "@/shared/types/prediction.types";

/** Closed vocabularies, mirroring the Literal types in ml/schema.py. */
export const OPTIONS = {
  programa: [
    "Ingenieria de Sistemas",
    "Ingenieria Civil",
    "Ingenieria Industrial",
    "Administracion de Empresas",
    "Contaduria Publica",
    "Derecho",
    "Psicologia",
    "Enfermeria",
    "Arquitectura",
    "Comunicacion Social"
  ],
  genero: ["F", "M", "Otro"],
  modalidad: ["Diurna", "Nocturna"],
  tipoAdmision: ["Regular", "Transferencia", "Reingreso", "Homologacion"],
  nivelEducativoPadres: [
    "Ninguno",
    "Primaria",
    "Secundaria",
    "Tecnico",
    "Universitario",
    "Posgrado"
  ],
  areaMateriaCritica: [
    "Matematicas y Ciencias Basicas",
    "Fundamentos Tecnicos",
    "Humanidades",
    "Economicas",
    "Salud"
  ],
  siNo: ["Si", "No"]
} as const;

/** The value used in the select to mean "no critical area", mapped to null on submit. */
export const SIN_AREA = "__sin_area__";

/**
 * A plausible student, so the form can be submitted immediately.
 *
 * Matches the example in the API README, which means the first prediction a user sees is
 * the same documented value (0.2289) -- handy when checking the wiring end to end.
 */
export const EXAMPLE_STUDENT: StudentFeatures = {
  semestre: 3,
  programa: "Ingenieria de Sistemas",
  materiasMatriculadas: 6,
  materiasAprobadas: 4,
  materiasReprobadas: 2,
  materiasRepetidas: 1,
  materiasCanceladas: 0,
  semestresRepetidos: 0,
  numeroMateriasConPerdidaHistorica: 2,
  notaPromedio: 3.2,
  promedioSemestreAnterior: 3.0,
  promedioAcumulado: 3.1,
  areaMateriaCritica: "Matematicas y Ciencias Basicas",
  porcentajeAsistencia: 85,
  inasistencias: 5,
  horasEstudioSemana: 10,
  edad: 20,
  genero: "M",
  estrato: 3,
  tipoAdmision: "Regular",
  modalidad: "Diurna",
  distanciaAUniversidadKm: 5,
  trabaja: "No",
  horasTrabajoSemana: 0,
  ingresoFamiliar: 2000000,
  recibeBeca: "No",
  becaPerdidaEnPeriodo: "No",
  dificultadEconomica: "No",
  tieneHijos: "No",
  nivelEducativoPadres: "Secundaria",
  apoyoFamiliarPercibido: 4,
  satisfaccionConPrograma: 4,
  participacionExtracurricular: "No",
  usoTutorias: "Si",
  codigo: ""
};

export const RISK_LABELS: Record<string, string> = {
  bajo: "Riesgo bajo",
  medio: "Riesgo medio",
  alto: "Riesgo alto"
};

/** What a band means in practice, for the headline panel. */
export const RISK_GUIDANCE: Record<string, string> = {
  bajo: "No requiere intervención inmediata. Mantener seguimiento habitual.",
  medio: "Conviene una conversación de seguimiento este periodo.",
  alto: "Priorizar contacto con el estudiante y revisar apoyos disponibles."
};

export const formatPercent = (value: number): string => `${(value * 100).toFixed(1)}%`;

export type FormValues = Record<string, string>;

/** Numeric features, so the form can turn their strings back into numbers. */
export const NUMERIC_FIELDS = new Set<string>([
  "semestre",
  "materiasMatriculadas",
  "materiasAprobadas",
  "materiasReprobadas",
  "materiasRepetidas",
  "materiasCanceladas",
  "semestresRepetidos",
  "numeroMateriasConPerdidaHistorica",
  "notaPromedio",
  "promedioSemestreAnterior",
  "promedioAcumulado",
  "porcentajeAsistencia",
  "inasistencias",
  "horasEstudioSemana",
  "edad",
  "estrato",
  "distanciaAUniversidadKm",
  "horasTrabajoSemana",
  "ingresoFamiliar",
  "apoyoFamiliarPercibido",
  "satisfaccionConPrograma"
]);

/** Student -> form strings. Null becomes the "no critical area" sentinel. */
export const toValues = (student: StudentFeatures): FormValues =>
  Object.fromEntries(
    Object.entries(student).map(([key, value]) => [
      key,
      value === null ? SIN_AREA : String(value ?? "")
    ])
  );

/**
 * Form strings -> the API's types.
 *
 * `areaMateriaCritica` must become **null**, never the sentinel and never "". The
 * preprocessing pipeline supplies the fill value it was trained with; sending a category
 * it never saw would be encoded as an all-zero row and quietly change the prediction for
 * the ~50% of students who have no critical area.
 */
export const toStudent = (values: FormValues): StudentFeatures => {
  const student: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key === "areaMateriaCritica") {
      student[key] = value === SIN_AREA || value === "" ? null : value;
    } else if (NUMERIC_FIELDS.has(key)) {
      student[key] = value === "" ? Number.NaN : Number(value);
    } else {
      student[key] = value;
    }
  }
  return student as unknown as StudentFeatures;
};

/**
 * The sample profiles in `src/shared/samples/`, for loading into the form.
 *
 * Probabilities are measured, not guessed -- see that folder's README. `missingArea` is the
 * one where the algorithms disagree, which is what the comparison view is for.
 */
export const SAMPLES: { label: string; hint: string; student: StudentFeatures }[] = [
  { label: "Riesgo bajo", hint: "2.6% · los 5 modelos coinciden", student: lowRisk as StudentFeatures },
  { label: "Modelos divididos", hint: "21.9% · 2 de 5 lo marcan", student: missingArea as StudentFeatures },
  { label: "Intermedio", hint: "52.1% · los 5 lo marcan", student: borderline as StudentFeatures },
  { label: "Riesgo alto", hint: "99.4% · los 5 lo marcan", student: highRisk as StudentFeatures }
];
