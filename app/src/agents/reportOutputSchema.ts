import { z } from 'zod'
import { REPORT_SECTIONS, type ReportContentKey } from '@/lib/reportSchema'

/** One described string per report field, so the model knows what goes where. */
const contentShape = Object.fromEntries(
  REPORT_SECTIONS.flatMap((section) =>
    section.fields.map((field) => [
      field.key,
      z
        .string()
        .describe(
          [`Sección ${section.number}. ${section.title} (${section.subtitle}) — ${field.label}.`, section.description, field.hint]
            .filter(Boolean)
            .join(' '),
        ),
    ]),
  ),
) as Record<ReportContentKey, z.ZodString>

/** Structured output requested from the report agent. */
export const aiReportSchema = z.object({
  title: z.string().describe('Título breve y descriptivo del informe, en español. Sin nombres propios.'),
  riskAlert: z
    .string()
    .describe(
      'Si detectas indicadores de violencia de género, maltrato infantil o riesgo de suicidio inminente, descríbelos aquí brevemente. Si no hay indicadores, cadena vacía.',
    ),
  content: z.object(contentShape),
})

export type AiReport = z.infer<typeof aiReportSchema>
