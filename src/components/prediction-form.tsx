import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  EXAMPLE_STUDENT,
  OPTIONS,
  SAMPLES,
  SIN_AREA,
  toStudent,
  toValues,
  type FormValues
} from "@/shared/helpers/student.helper";
import type { StudentFeatures } from "@/shared/types/prediction.types";

interface FieldSpec {
  name: keyof StudentFeatures;
  label: string;
  kind: "number" | "text" | "select";
  options?: readonly string[];
  step?: string;
}

/**
 * The eight groups mirror ml/schema.py's own sections, so the form reads in the same order
 * the contract is declared and a new feature has an obvious home.
 */
const GROUPS: { title: string; description: string; fields: FieldSpec[] }[] = [
  {
    title: "Carga y rendimiento académico",
    description: "Materias del periodo y promedios.",
    fields: [
      { name: "semestre", label: "Semestre", kind: "number" },
      { name: "programa", label: "Programa", kind: "select", options: OPTIONS.programa },
      { name: "materiasMatriculadas", label: "Materias matriculadas", kind: "number" },
      { name: "materiasAprobadas", label: "Materias aprobadas", kind: "number" },
      { name: "materiasReprobadas", label: "Materias reprobadas", kind: "number" },
      { name: "materiasRepetidas", label: "Materias repetidas", kind: "number" },
      { name: "materiasCanceladas", label: "Materias canceladas", kind: "number" },
      { name: "semestresRepetidos", label: "Semestres repetidos", kind: "number" },
      {
        name: "numeroMateriasConPerdidaHistorica",
        label: "Materias perdidas históricamente",
        kind: "number"
      },
      { name: "notaPromedio", label: "Nota promedio (0-5)", kind: "number", step: "0.01" },
      {
        name: "promedioSemestreAnterior",
        label: "Promedio semestre anterior",
        kind: "number",
        step: "0.01"
      },
      { name: "promedioAcumulado", label: "Promedio acumulado", kind: "number", step: "0.01" },
      {
        name: "areaMateriaCritica",
        label: "Área crítica",
        kind: "select",
        options: [SIN_AREA, ...OPTIONS.areaMateriaCritica]
      }
    ]
  },
  {
    title: "Asistencia y estudio",
    description: "Presencia en clase y horas dedicadas.",
    fields: [
      { name: "porcentajeAsistencia", label: "Asistencia (%)", kind: "number", step: "0.1" },
      { name: "inasistencias", label: "Inasistencias", kind: "number" },
      { name: "horasEstudioSemana", label: "Horas de estudio/semana", kind: "number", step: "0.1" }
    ]
  },
  {
    title: "Datos demográficos",
    description: "Edad, género y estrato.",
    fields: [
      { name: "edad", label: "Edad", kind: "number" },
      { name: "genero", label: "Género", kind: "select", options: OPTIONS.genero },
      { name: "estrato", label: "Estrato (1-6)", kind: "number" }
    ]
  },
  {
    title: "Admisión y desplazamiento",
    description: "Vía de ingreso y distancia al campus.",
    fields: [
      {
        name: "tipoAdmision",
        label: "Tipo de admisión",
        kind: "select",
        options: OPTIONS.tipoAdmision
      },
      { name: "modalidad", label: "Modalidad", kind: "select", options: OPTIONS.modalidad },
      {
        name: "distanciaAUniversidadKm",
        label: "Distancia a la universidad (km)",
        kind: "number",
        step: "0.1"
      }
    ]
  },
  {
    title: "Situación laboral",
    description: "Trabajo durante el periodo.",
    fields: [
      { name: "trabaja", label: "Trabaja", kind: "select", options: OPTIONS.siNo },
      { name: "horasTrabajoSemana", label: "Horas de trabajo/semana", kind: "number" }
    ]
  },
  {
    title: "Situación económica",
    description: "Ingresos, becas y dificultades.",
    fields: [
      { name: "ingresoFamiliar", label: "Ingreso familiar (COP)", kind: "number" },
      { name: "recibeBeca", label: "Recibe beca", kind: "select", options: OPTIONS.siNo },
      {
        name: "becaPerdidaEnPeriodo",
        label: "Perdió la beca este periodo",
        kind: "select",
        options: OPTIONS.siNo
      },
      {
        name: "dificultadEconomica",
        label: "Dificultad económica",
        kind: "select",
        options: OPTIONS.siNo
      }
    ]
  },
  {
    title: "Entorno familiar",
    description: "Hijos, educación de los padres y apoyo percibido.",
    fields: [
      { name: "tieneHijos", label: "Tiene hijos", kind: "select", options: OPTIONS.siNo },
      {
        name: "nivelEducativoPadres",
        label: "Educación de los padres",
        kind: "select",
        options: OPTIONS.nivelEducativoPadres
      },
      { name: "apoyoFamiliarPercibido", label: "Apoyo familiar (1-5)", kind: "number" }
    ]
  },
  {
    title: "Vinculación con el programa",
    description: "Satisfacción y uso de servicios.",
    fields: [
      { name: "satisfaccionConPrograma", label: "Satisfacción (1-5)", kind: "number" },
      {
        name: "participacionExtracurricular",
        label: "Participa en actividades",
        kind: "select",
        options: OPTIONS.siNo
      },
      { name: "usoTutorias", label: "Usa tutorías", kind: "select", options: OPTIONS.siNo },
      { name: "codigo", label: "Código del estudiante (opcional)", kind: "text" }
    ]
  }
];

interface PredictionFormProps {
  onSubmit: (_student: StudentFeatures) => void;
  isPending: boolean;
}

export function PredictionForm ({ onSubmit, isPending }: PredictionFormProps) {
  const [values, setValues] = useState<FormValues>(() => toValues(EXAMPLE_STUDENT));

  const set = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(toStudent(values));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfiles de ejemplo</CardTitle>
          <CardDescription>
            Cargan un estudiante de <code>src/shared/samples/</code> para ver el modelo en
            distintos puntos de su rango.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <Button
              key={sample.label}
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              title={sample.hint}
              onClick={() => setValues(toValues(sample.student))}
            >
              {sample.label}
              <span className="ml-2 text-xs text-muted-foreground">{sample.hint}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle className="text-base">{group.title}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {group.fields.map((field) => (
              <div key={field.name as string} className="flex flex-col gap-2">
                <Label htmlFor={field.name as string}>{field.label}</Label>
                {field.kind === "select" ? (
                  <Select
                    value={String(values[field.name as string] ?? "")}
                    // Base UI emits null when a select is cleared; the form state is
                    // string-only and toStudent maps the sentinel back to null.
                    onValueChange={(value) => set(field.name as string, value ?? "")}
                  >
                    <SelectTrigger id={field.name as string}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option === SIN_AREA ? "Sin área crítica" : option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name as string}
                    type={field.kind === "number" ? "number" : "text"}
                    step={field.step}
                    value={values[field.name as string] ?? ""}
                    onChange={(event) => set(field.name as string, event.target.value)}
                    disabled={isPending}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Analizando..." : "Calcular riesgo"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => setValues(toValues(EXAMPLE_STUDENT))}
        >
          Restablecer ejemplo
        </Button>
      </div>
    </form>
  );
}
