import { z } from 'zod'

/** Visit types and validation shared by client and server (no DB imports). */
export interface Visit {
  id: number
  clientName: string
  /** Local date and time of the visit, "YYYY-MM-DDTHH:MM" (legacy rows: "YYYY-MM-DD"). */
  visitDate: string
  interviewNotes: string
  socioeconomicData: string
  lifeHistory: string
  createdAt: string
}

const longText = (label: string) => z.string().trim().min(1, `${label} es obligatorio`).max(20000)

export const visitInputSchema = z.object({
  clientName: z.string().trim().min(1, 'El nombre del cliente es obligatorio').max(200),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'La fecha y hora no son válidas'),
  interviewNotes: longText('Las notas de la entrevista'),
  socioeconomicData: longText('Los datos socioeconómicos'),
  lifeHistory: longText('La historia de vida'),
})

export type VisitInput = z.infer<typeof visitInputSchema>
