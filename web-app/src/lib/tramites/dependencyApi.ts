/**
 * Cliente de la API de Dependencia (SAAD). DE MOMENTO DEVUELVE DATOS SIMULADOS.
 *
 * La interfaz pública (tipos + funciones async) es la que consumirá la UI; para conectar
 * la API real de la administración solo hay que reimplementar estas funciones.
 * Todos los nombres y datos son inventados.
 */

export const DEPENDENCY_STATUSES = [
  'Solicitud registrada',
  'Pendiente de valoración',
  'Valorado',
  'PIA en elaboración',
  'Resuelto',
  'En revisión de grado',
] as const

export type DependencyStatus = (typeof DEPENDENCY_STATUSES)[number]

export type DependencyGrade = 'Sin grado' | 'Grado I' | 'Grado II' | 'Grado III'

export interface TimelineStep {
  label: string
  date: string | null
  done: boolean
  description?: string
}

export interface DependencyService {
  name: string
  kind: 'Servicio' | 'Prestación económica'
  status: 'Activo' | 'Propuesto' | 'En lista de espera'
  /** Euros/mes, solo para prestaciones económicas. */
  monthlyAmount?: number
  provider?: string
}

export interface DependencyCase {
  id: string
  applicantName: string
  /** DNI enmascarado tal y como lo devolvería la API. */
  maskedId: string
  birthDate: string
  municipality: string
  status: DependencyStatus
  grade: DependencyGrade | null
  /** Puntuación del Baremo de Valoración de la Dependencia (BVD), 0-100. */
  bvdScore: number | null
  requestDate: string
  lastUpdate: string
  socialServicesCenter: string
  timeline: TimelineStep[]
  services: DependencyService[]
  pendingDocuments: string[]
  nextDeadline?: { label: string; date: string }
}

export interface DependencySummary {
  total: number
  pendingAssessment: number
  pendingPia: number
  withPendingDocuments: number
}

const step = (label: string, date: string | null, description?: string): TimelineStep => ({
  label,
  date,
  done: date !== null,
  description,
})

const MOCK_CASES: DependencyCase[] = [
  {
    id: 'EXP-DEP-2026-004512',
    applicantName: 'Carmen Ruiz Delgado',
    maskedId: '***4512**',
    birthDate: '1946-03-12',
    municipality: 'Sevilla',
    status: 'PIA en elaboración',
    grade: 'Grado II',
    bvdScore: 58,
    requestDate: '2026-04-02',
    lastUpdate: '2026-10-08',
    socialServicesCenter: 'CSS Macarena',
    timeline: [
      step('Solicitud registrada', '2026-04-02'),
      step('Visita de valoración', '2026-06-18', 'Valoración en domicilio con BVD.'),
      step('Resolución de grado', '2026-08-05', 'Grado II · Dependencia severa (58 puntos).'),
      step('Elaboración del PIA', null, 'Propuesta de recursos en curso.'),
      step('Resolución del PIA', null),
    ],
    services: [
      { name: 'Ayuda a domicilio (SAD)', kind: 'Servicio', status: 'Propuesto', provider: 'Ayuntamiento de Sevilla' },
      { name: 'Teleasistencia avanzada', kind: 'Servicio', status: 'Activo', provider: 'Diputación de Sevilla' },
    ],
    pendingDocuments: ['Certificado de empadronamiento actualizado'],
    nextDeadline: { label: 'Aportar documentación', date: '2026-10-28' },
  },
  {
    id: 'EXP-DEP-2026-003987',
    applicantName: 'Antonio Gil Moreno',
    maskedId: '***3987**',
    birthDate: '1939-11-30',
    municipality: 'Dos Hermanas',
    status: 'Resuelto',
    grade: 'Grado III',
    bvdScore: 81,
    requestDate: '2025-11-20',
    lastUpdate: '2026-07-14',
    socialServicesCenter: 'CSS Dos Hermanas Centro',
    timeline: [
      step('Solicitud registrada', '2025-11-20'),
      step('Visita de valoración', '2026-01-22'),
      step('Resolución de grado', '2026-03-10', 'Grado III · Gran dependencia (81 puntos).'),
      step('Elaboración del PIA', '2026-05-30'),
      step('Resolución del PIA', '2026-07-14', 'Centro de día + prestación por cuidados en el entorno familiar.'),
    ],
    services: [
      { name: 'Centro de día', kind: 'Servicio', status: 'Activo', provider: 'Centro de Día Los Olivos' },
      { name: 'Prestación económica para cuidados en el entorno familiar (PECEF)', kind: 'Prestación económica', status: 'Activo', monthlyAmount: 455.4 },
    ],
    pendingDocuments: [],
  },
  {
    id: 'EXP-DEP-2026-005230',
    applicantName: 'Lucía Fernández Prieto',
    maskedId: '***5230**',
    birthDate: '1952-07-08',
    municipality: 'Sevilla',
    status: 'Pendiente de valoración',
    grade: null,
    bvdScore: null,
    requestDate: '2026-08-21',
    lastUpdate: '2026-09-30',
    socialServicesCenter: 'CSS Triana',
    timeline: [
      step('Solicitud registrada', '2026-08-21'),
      step('Visita de valoración', null, 'Pendiente de cita.'),
      step('Resolución de grado', null),
      step('Elaboración del PIA', null),
      step('Resolución del PIA', null),
    ],
    services: [],
    pendingDocuments: ['Informe de condiciones de salud', 'Copia del DNI del representante'],
    nextDeadline: { label: 'Plazo para aportar el informe de salud', date: '2026-10-20' },
  },
  {
    id: 'EXP-DEP-2026-002101',
    applicantName: 'José Navarro Ortega',
    maskedId: '***2101**',
    birthDate: '1944-01-25',
    municipality: 'Alcalá de Guadaíra',
    status: 'En revisión de grado',
    grade: 'Grado I',
    bvdScore: 34,
    requestDate: '2025-06-03',
    lastUpdate: '2026-09-12',
    socialServicesCenter: 'CSS Alcalá Norte',
    timeline: [
      step('Solicitud registrada', '2025-06-03'),
      step('Visita de valoración', '2025-08-11'),
      step('Resolución de grado', '2025-10-02', 'Grado I · Dependencia moderada (34 puntos).'),
      step('Resolución del PIA', '2026-01-15', 'Teleasistencia + SAD (20 h/mes).'),
      step('Solicitud de revisión de grado', '2026-09-12', 'Empeoramiento por ictus en agosto de 2026.'),
    ],
    services: [
      { name: 'Teleasistencia', kind: 'Servicio', status: 'Activo', provider: 'Diputación de Sevilla' },
      { name: 'Ayuda a domicilio (SAD) · 20 h/mes', kind: 'Servicio', status: 'Activo', provider: 'Ayuntamiento de Alcalá' },
    ],
    pendingDocuments: ['Informe médico posterior al ictus'],
    nextDeadline: { label: 'Nueva visita de valoración', date: '2026-11-04' },
  },
  {
    id: 'EXP-DEP-2026-005611',
    applicantName: 'Rosario Martín Vega',
    maskedId: '***5611**',
    birthDate: '1958-12-02',
    municipality: 'Sevilla',
    status: 'Solicitud registrada',
    grade: null,
    bvdScore: null,
    requestDate: '2026-10-06',
    lastUpdate: '2026-10-06',
    socialServicesCenter: 'CSS Macarena',
    timeline: [
      step('Solicitud registrada', '2026-10-06'),
      step('Visita de valoración', null),
      step('Resolución de grado', null),
      step('Elaboración del PIA', null),
      step('Resolución del PIA', null),
    ],
    services: [],
    pendingDocuments: [],
  },
  {
    id: 'EXP-DEP-2026-001876',
    applicantName: 'Manuel Ortiz Cano',
    maskedId: '***1876**',
    birthDate: '1950-05-17',
    municipality: 'Mairena del Aljarafe',
    status: 'Valorado',
    grade: 'Sin grado',
    bvdScore: 18,
    requestDate: '2026-02-14',
    lastUpdate: '2026-06-27',
    socialServicesCenter: 'CSS Aljarafe',
    timeline: [
      step('Solicitud registrada', '2026-02-14'),
      step('Visita de valoración', '2026-05-09'),
      step('Resolución de grado', '2026-06-27', 'Sin grado reconocido (18 puntos, mínimo 25).'),
    ],
    services: [],
    pendingDocuments: [],
    nextDeadline: { label: 'Fin del plazo de recurso de alzada', date: '2026-07-27' },
  },
]

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Busca expedientes por nombre, número de expediente o municipio. */
export async function searchDependencyCases(query?: string, status?: DependencyStatus): Promise<DependencyCase[]> {
  const q = query ? normalize(query.trim()) : ''
  return MOCK_CASES.filter(
    (c) =>
      (!status || c.status === status) &&
      (!q || [c.applicantName, c.id, c.municipality].some((field) => normalize(field).includes(q))),
  ).sort((a, b) => b.lastUpdate.localeCompare(a.lastUpdate))
}

export async function getDependencyCase(id: string): Promise<DependencyCase | null> {
  return MOCK_CASES.find((c) => c.id === id) ?? null
}

export async function getDependencySummary(): Promise<DependencySummary> {
  return {
    total: MOCK_CASES.length,
    pendingAssessment: MOCK_CASES.filter((c) => c.status === 'Solicitud registrada' || c.status === 'Pendiente de valoración').length,
    pendingPia: MOCK_CASES.filter((c) => c.status === 'PIA en elaboración').length,
    withPendingDocuments: MOCK_CASES.filter((c) => c.pendingDocuments.length > 0).length,
  }
}
