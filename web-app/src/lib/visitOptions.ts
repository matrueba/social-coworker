import type { VisitOption } from '@/components/reports/ReportForm'
import { listVisits } from './db/visits'
import { formatLocalDateTime } from './format'

/** Visits as options for the "Visita asociada" select of the report form. */
export function getVisitOptions(): VisitOption[] {
  return listVisits().map((visit) => ({
    id: visit.id,
    clientName: visit.clientName,
    label: `${visit.clientName} · ${formatLocalDateTime(visit.visitDate)}`,
  }))
}
