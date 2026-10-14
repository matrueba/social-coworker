'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { confirmReport, createReport, deleteReport, getReport, updateReportStatus } from '@/lib/db/reports'
import { readReportForm } from '@/lib/reportFormData'
import { REPORT_STATUSES, isDraft } from '@/lib/reportSchema'

export interface ReportFormState {
  error?: string
  /** Validation messages keyed by form field name. */
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

const idSchema = z.coerce.number().int().positive()

/** Server Action: validates and stores a new manual report, then redirects to it. */
export async function createReportAction(_prev: ReportFormState, formData: FormData): Promise<ReportFormState> {
  const form = readReportForm(formData)
  if (!form.success) return { error: 'Revisa los campos marcados.', fieldErrors: form.fieldErrors, values: form.values }

  let id: number
  try {
    id = createReport(form.data).id
  } catch (err) {
    console.error(JSON.stringify({ event: 'report.create.failed', message: String(err) }))
    return { error: 'No se pudo guardar el informe. Inténtalo de nuevo.', values: form.values }
  }
  revalidatePath('/', 'layout')
  redirect(`/reports/${id}`)
}

/** Server Action: saves the reviewed AI draft and confirms it. Bound to the report id. */
export async function confirmReportAction(
  reportId: number,
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const form = readReportForm(formData)
  if (!form.success) return { error: 'Revisa los campos marcados.', fieldErrors: form.fieldErrors, values: form.values }

  const report = getReport(reportId)
  if (!report || !isDraft(report)) return { error: 'Este borrador ya no existe o ya fue confirmado.', values: form.values }

  try {
    confirmReport(reportId, form.data)
  } catch (err) {
    console.error(JSON.stringify({ event: 'report.confirm.failed', reportId, message: String(err) }))
    return { error: 'No se pudo confirmar el informe. Inténtalo de nuevo.', values: form.values }
  }
  revalidatePath('/', 'layout')
  redirect(`/reports/${reportId}`)
}

/** Server Action: deletes an AI draft that the user rejects. */
export async function discardDraftAction(formData: FormData): Promise<void> {
  const id = idSchema.safeParse(formData.get('id'))
  if (!id.success) return
  const report = getReport(id.data)
  if (!report || !isDraft(report)) return
  deleteReport(id.data)
  revalidatePath('/', 'layout')
  redirect(report.visitId ? `/visits/${report.visitId}` : '/reports')
}

export async function updateReportStatusAction(formData: FormData): Promise<void> {
  const id = idSchema.safeParse(formData.get('id'))
  const status = z.enum(REPORT_STATUSES).safeParse(formData.get('status'))
  if (!id.success || !status.success) return
  updateReportStatus(id.data, status.data)
  revalidatePath('/', 'layout')
}

export async function deleteReportAction(formData: FormData): Promise<void> {
  const id = idSchema.safeParse(formData.get('id'))
  if (!id.success) return
  deleteReport(id.data)
  revalidatePath('/', 'layout')
  redirect('/reports')
}
