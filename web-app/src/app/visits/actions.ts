'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ReportGenerationError, generateReportFromVisit } from '@/agents/agent'
import { createReport } from '@/lib/db/reports'
import { createVisit, deleteVisit, getVisit } from '@/lib/db/visits'
import { visitInputSchema } from '@/lib/visitSchema'

export interface VisitFormState {
  error?: string
  values?: Record<string, string>
}

const FIELDS = ['clientName', 'visitDate', 'interviewNotes', 'socioeconomicData', 'lifeHistory'] as const

/** Server Action: validates and stores a new visit, then redirects to it. */
export async function createVisitAction(_prev: VisitFormState, formData: FormData): Promise<VisitFormState> {
  const raw = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? '')]))
  const parsed = visitInputSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos no válidos', values: raw }
  }
  let id: number
  try {
    id = createVisit(parsed.data).id
  } catch (err) {
    console.error(JSON.stringify({ event: 'visit.create.failed', message: String(err) }))
    return { error: 'No se pudo guardar la visita. Inténtalo de nuevo.', values: raw }
  }
  revalidatePath('/visits')
  redirect(`/visits/${id}`)
}

export async function deleteVisitAction(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().safeParse(formData.get('id'))
  if (!id.success) return
  deleteVisit(id.data)
  revalidatePath('/visits')
  redirect('/visits')
}

export interface GenerateReportState {
  error?: string
}

/**
 * Server Action: asks the AI agent for a full report based on a visit and stores it
 * as a draft. The user is then taken to the review screen to edit and confirm it.
 */
export async function generateReportAction(_prev: GenerateReportState, formData: FormData): Promise<GenerateReportState> {
  const visitId = z.coerce.number().int().positive().safeParse(formData.get('visitId'))
  if (!visitId.success) return { error: 'Visita no válida.' }
  const visit = getVisit(visitId.data)
  if (!visit) return { error: 'La visita no existe.' }

  let reportId: number
  try {
    const generated = await generateReportFromVisit(visit)
    reportId = createReport(
      {
        title: generated.title || `Informe de la visita del ${visit.visitDate.slice(0, 10)}`,
        clientName: visit.clientName,
        status: 'Pendiente',
        visitId: visit.id,
        content: generated.content,
      },
      'ai',
    ).id
  } catch (err) {
    console.error(JSON.stringify({ event: 'report.generate.failed', visitId: visit.id, message: String(err) }))
    if (err instanceof ReportGenerationError) return { error: err.message }
    return { error: 'No se pudo generar el informe con IA. Inténtalo de nuevo en unos minutos.' }
  }

  revalidatePath('/', 'layout')
  redirect(`/reports/${reportId}/review`)
}
