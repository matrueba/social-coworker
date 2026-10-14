import { REPORT_CONTENT_KEYS, reportInputSchema, type Report, type ReportInput } from './reportSchema'

const META_FIELDS = ['title', 'clientName', 'status', 'visitId'] as const

export type ReportFormValues = Record<string, string>

export type ReadReportFormResult =
  | { success: true; data: ReportInput; values: ReportFormValues }
  | { success: false; fieldErrors: Record<string, string>; values: ReportFormValues }

/** Reads and validates the report form (shared by create and review/confirm). */
export function readReportForm(formData: FormData): ReadReportFormResult {
  const values: ReportFormValues = Object.fromEntries(
    [...META_FIELDS, ...REPORT_CONTENT_KEYS].map((name) => [name, String(formData.get(name) ?? '')]),
  )
  const parsed = reportInputSchema.safeParse({
    title: values.title,
    clientName: values.clientName,
    status: values.status || undefined,
    visitId: values.visitId,
    content: Object.fromEntries(REPORT_CONTENT_KEYS.map((key) => [key, values[key]])),
  })
  if (parsed.success) return { success: true, data: parsed.data, values }

  const fieldErrors: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const field = String(issue.path[issue.path.length - 1] ?? '')
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return { success: false, fieldErrors, values }
}

/** Form values pre-filled from a stored report (used to review AI drafts). */
export function reportToFormValues(report: Report): ReportFormValues {
  return {
    title: report.title,
    clientName: report.clientName,
    status: report.status,
    visitId: report.visitId ? String(report.visitId) : '',
    ...report.content,
  }
}
