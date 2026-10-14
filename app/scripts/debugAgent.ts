/**
 * Runs the report agent outside Next.js so it can be debugged with breakpoints.
 *
 *   VISIT_ID=3 → uses that visit from the SQLite database
 *   (unset)    → uses the sample case below
 *
 * Launch it from VS Code: "Depurar agente (caso de ejemplo / visita)".
 */
import { generateReportFromVisit } from '@/agents/agent'
import { getVisit } from '@/lib/db/visits'
import type { Visit } from '@/lib/visitSchema'

const SAMPLE_VISIT: Visit = {
  id: 0,
  clientName: 'Caso de ejemplo',
  visitDate: '2026-10-14T10:00',
  interviewNotes: `Se trata de una situación que presenta el sobrino de la persona objeto del supuesto.
Mujer de 80 años que acaba de enviudar, no hijos, no familiares directos. Solo 1 sobrino cuyo apoyo es insuficiente.
Limitaciones cognitivas. Limitaciones fisicas típicas de la edad. Se siente sola y aislada. Solicita ayuda para
problemas de autonomia personal`,
  socioeconomicData: 'No hay datos',
  lifeHistory: 'No hay datos',
  createdAt: '2026-10-14 10:00:00',
}

function loadVisit(): Visit {
  const visitId = process.env.VISIT_ID ? Number(process.env.VISIT_ID) : null
  if (!visitId) return SAMPLE_VISIT
  const visit = getVisit(visitId)
  if (!visit) throw new Error(`No existe la visita ${visitId}`)
  return visit
}

async function main() {
  const visit = loadVisit()
  console.log(`Generando informe para: ${visit.clientName} (visita ${visit.id || 'de ejemplo'})`)
  const startedAt = Date.now()
  const report = await generateReportFromVisit(visit)
  console.log(`\nGenerado en ${((Date.now() - startedAt) / 1000).toFixed(1)} s\n`)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((err: unknown) => {
  console.error(err)
  process.exitCode = 1
})
