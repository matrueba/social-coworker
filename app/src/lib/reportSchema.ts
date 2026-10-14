import { z } from 'zod'

/** Report types, validation and section layout shared by client and server (no DB imports). */
export const REPORT_STATUSES = ['Pendiente', 'En Progreso', 'Completo'] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

const MAX_FIELD_LENGTH = 10000

const requiredText = (message: string) => z.string().trim().min(1, message).max(MAX_FIELD_LENGTH)
const optionalText = () => z.string().trim().max(MAX_FIELD_LENGTH).default('')

/**
 * Structured body of a social report. Mirrors the output structure the AI agent
 * is instructed to produce (see `src/agents/instructions.ts`).
 */
export const reportContentSchema = z.object({
  // 1. Resumen del caso
  caseSummary: requiredText('El resumen del caso es obligatorio'),
  consultationReason: requiredText('El motivo de consulta es obligatorio'),
  // 2. Problemas detectados
  needsHousing: optionalText(),
  needsEconomic: optionalText(),
  needsRelational: optionalText(),
  needsHealth: optionalText(),
  explicitDemand: optionalText(),
  implicitDemand: optionalText(),
  // 3. Valoración objetiva
  criteriaAnalysis: optionalText(),
  technicalOpinion: optionalText(),
  // 4. Análisis de carencias de información
  criticalMissing: optionalText(),
  clarificationNeeded: optionalText(),
  // 5. Objetivos SMART
  smartObjectives: optionalText(),
  // 6. Plan de acción y recursos
  officialResources: optionalText(),
  referrals: optionalText(),
  immediateActions: optionalText(),
  mediumTermActions: optionalText(),
  // 7. Preguntas para la próxima entrevista
  nextInterviewQuestions: optionalText(),
})

export type ReportContent = z.infer<typeof reportContentSchema>

export type ReportContentKey = keyof ReportContent

export const REPORT_CONTENT_KEYS = Object.keys(reportContentSchema.shape) as ReportContentKey[]

export type ReportSource = 'manual' | 'ai'

export interface Report {
  id: number
  title: string
  clientName: string
  status: ReportStatus
  visitId: number | null
  content: ReportContent
  source: ReportSource
  /** Null while the report is a draft pending human review (AI-generated reports). */
  confirmedAt: string | null
  createdAt: string
  updatedAt: string
}

export const isDraft = (report: Pick<Report, 'confirmedAt'>) => report.confirmedAt === null

export interface ReportStats {
  total: number
  byStatus: Record<ReportStatus, number>
  /** AI drafts pending review (not included in total/byStatus). */
  drafts: number
}

const emptyToNull = (value: unknown) => (value === '' || value === undefined ? null : value)

export const reportInputSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(200),
  clientName: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  status: z.enum(REPORT_STATUSES).default('Pendiente'),
  visitId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable()),
  content: reportContentSchema,
})

export type ReportInput = z.infer<typeof reportInputSchema>

/** Reads stored JSON leniently: unknown keys are dropped and missing ones become ''. */
export function parseStoredContent(json: string): ReportContent {
  let raw: Record<string, unknown> = {}
  try {
    const parsed: unknown = JSON.parse(json)
    if (parsed && typeof parsed === 'object') raw = parsed as Record<string, unknown>
  } catch {
    // Corrupt content is shown as empty rather than breaking the page
  }
  return Object.fromEntries(
    REPORT_CONTENT_KEYS.map((key) => [key, typeof raw[key] === 'string' ? raw[key] : '']),
  ) as ReportContent
}

// ── Section layout (labels in Spanish) ──

export type FieldTone = 'critical' | 'warning'

export interface ReportField {
  key: ReportContentKey
  label: string
  hint?: string
  half?: boolean
  rows?: number
  tone?: FieldTone
}

export interface ReportSection {
  id: string
  number: number
  title: string
  subtitle: string
  description?: string
  fields: ReportField[]
}

export const REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'resumen',
    number: 1,
    title: 'Resumen del caso',
    subtitle: 'Narrativa del genograma',
    fields: [
      {
        key: 'caseSummary',
        label: 'Resumen ejecutivo',
        hint: 'Composición familiar y situación de convivencia actual (máx. 5 líneas).',
        rows: 5,
      },
      { key: 'consultationReason', label: 'Motivo principal de consulta', rows: 3 },
    ],
  },
  {
    id: 'diagnostico',
    number: 2,
    title: 'Problemas detectados',
    subtitle: 'Diagnóstico social',
    description: 'Necesidades por categoría y distinción entre demanda explícita e implícita.',
    fields: [
      { key: 'needsHousing', label: 'Vivienda', rows: 3 },
      { key: 'needsEconomic', label: 'Económica', rows: 3 },
      { key: 'needsRelational', label: 'Relacional', rows: 3 },
      { key: 'needsHealth', label: 'Salud', rows: 3 },
      { key: 'explicitDemand', label: 'Demanda explícita', hint: 'Lo que solicita la persona usuaria.', rows: 3 },
      { key: 'implicitDemand', label: 'Demanda implícita', hint: 'Lo que detectas como profesional.', rows: 3 },
    ],
  },
  {
    id: 'valoracion',
    number: 3,
    title: 'Valoración objetiva',
    subtitle: 'Datos vs. criterios',
    description:
      'Aplica el marco de referencia o los criterios recogidos en las notas. Si no hay un marco específico, aplica los criterios estándar de vulnerabilidad (ingresos vs. IPREM, red de apoyo) e indícalo.',
    fields: [
      {
        key: 'criteriaAnalysis',
        label: 'Análisis de criterios',
        hint: 'Formato: [Criterio]: CUMPLE / NO CUMPLE → Evidencia. Ej.: «Límite de ingresos (<800 €): CUMPLE (pensión de 750 €)».',
        rows: 5,
      },
      { key: 'technicalOpinion', label: 'Opinión técnica', hint: 'Conclusión basada estrictamente en el cruce de datos y criterios.', rows: 4 },
    ],
  },
  {
    id: 'carencias',
    number: 4,
    title: 'Análisis de carencias de información',
    subtitle: 'Semáforo',
    fields: [
      {
        key: 'criticalMissing',
        label: 'Falta información crítica',
        hint: 'Datos imprescindibles para valorar los criterios (p. ej., certificado de empadronamiento actualizado).',
        half: true,
        rows: 4,
        tone: 'critical',
      },
      {
        key: 'clarificationNeeded',
        label: 'Requiere aclaración',
        hint: 'Incoherencias o detalles ambiguos en el relato.',
        half: true,
        rows: 4,
        tone: 'warning',
      },
    ],
  },
  {
    id: 'objetivos',
    number: 5,
    title: 'Objetivos SMART',
    subtitle: 'Específicos, medibles, alcanzables, relevantes y con plazo',
    fields: [{ key: 'smartObjectives', label: 'Objetivos', hint: 'Propón 2-3 objetivos.', rows: 5 }],
  },
  {
    id: 'plan',
    number: 6,
    title: 'Plan de acción y recursos',
    subtitle: 'Recursos, derivaciones y hoja de ruta',
    fields: [
      {
        key: 'officialResources',
        label: 'Recursos oficiales',
        hint: 'Ayudas, normativa o trámites aplicables, con el enlace oficial.',
        rows: 4,
      },
      { key: 'referrals', label: 'Derivaciones', hint: 'Instituciones o profesionales, con datos de contacto.', rows: 3 },
      { key: 'immediateActions', label: 'Hoja de ruta · Inmediato', half: true, rows: 4 },
      { key: 'mediumTermActions', label: 'Hoja de ruta · Medio plazo', half: true, rows: 4 },
    ],
  },
  {
    id: 'preguntas',
    number: 7,
    title: 'Preguntas para la próxima entrevista',
    subtitle: 'Cubrir carencias y explorar riesgos latentes',
    fields: [{ key: 'nextInterviewQuestions', label: 'Preguntas', hint: '3-5 preguntas abiertas.', rows: 5 }],
  },
]

/** Content fields that must be filled in (derived from the schema). */
export const REQUIRED_CONTENT_KEYS = new Set<ReportContentKey>(['caseSummary', 'consultationReason'])
