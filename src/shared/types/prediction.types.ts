export type RiskLevel = "bajo" | "medio" | "alto";

/** The 34 features the model consumes. Mirrors ml/schema.py:StudentFeatures. */
export interface StudentFeatures {
  semestre: number;
  programa: string;
  materiasMatriculadas: number;
  materiasAprobadas: number;
  materiasReprobadas: number;
  materiasRepetidas: number;
  materiasCanceladas: number;
  semestresRepetidos: number;
  numeroMateriasConPerdidaHistorica: number;
  notaPromedio: number;
  promedioSemestreAnterior: number;
  promedioAcumulado: number;
  /** Null for the ~50% of students with no critical area. Never an empty string. */
  areaMateriaCritica: string | null;
  porcentajeAsistencia: number;
  inasistencias: number;
  horasEstudioSemana: number;
  edad: number;
  genero: string;
  estrato: number;
  tipoAdmision: string;
  modalidad: string;
  distanciaAUniversidadKm: number;
  trabaja: string;
  horasTrabajoSemana: number;
  ingresoFamiliar: number;
  recibeBeca: string;
  becaPerdidaEnPeriodo: string;
  dificultadEconomica: string;
  tieneHijos: string;
  nivelEducativoPadres: string;
  apoyoFamiliarPercibido: number;
  satisfaccionConPrograma: number;
  participacionExtracurricular: string;
  usoTutorias: string;
  /** Optional student code. Not a feature -- it only links the audit row. */
  codigo?: string | null;
}

export interface PredictionResult {
  deserta: boolean;
  probabilidad: number;
  riesgo: RiskLevel;
}

/** One algorithm's answer, with the threshold it was calibrated against. */
export interface ModelPrediction extends PredictionResult {
  algorithm: string;
  isBest: boolean;
  decisionThreshold: number;
  cvMetrics: Record<string, number>;
  testMetrics: Record<string, number>;
}

export interface ComparePredictionResponse {
  bestAlgorithm: string;
  models: ModelPrediction[];
}

export interface ComparisonRow {
  model: string;
  rocAucMean: number;
  rocAucStd: number;
  f1Mean: number;
  recallMean: number;
  accuracyMean: number;
}

export interface BatchComparePredictionResponse {
  comparisons: ComparePredictionResponse[];
  count: number;
}

export interface ModelInfo {
  modelName: string;
  modelVersion: string;
  nFeatures: number;
  features: string[];
  decisionThreshold: number;
  riskBands: Record<string, number[]>;
  testMetrics: Record<string, number>;
  comparison: ComparisonRow[];
}

export interface PredictionRecord extends PredictionResult {
  id: number;
  modelVersionId: number | null;
  studentId: number | null;
  createdAt: string;
}

export interface PaginatedPredictions {
  items: PredictionRecord[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface StatsOverview {
  totalPredictions: number;
  byRisk: { riesgo: RiskLevel; count: number }[];
  flaggedShare: number;
  perDay: { date: string; count: number }[];
  trainingRecords: number;
  trainingDropoutRate: number;
  topFeatures: { feature: string; importance: number }[];
  modelName: string | null;
  modelRocAuc: number | null;
}
