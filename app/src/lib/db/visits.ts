import { getDb } from './client'
import type { Visit, VisitInput } from '../visitSchema'

interface VisitRow {
  id: number
  client_name: string
  visit_date: string
  interview_notes: string
  socioeconomic_data: string
  life_history: string
  created_at: string
}

const toVisit = (row: VisitRow): Visit => ({
  id: row.id,
  clientName: row.client_name,
  visitDate: row.visit_date,
  interviewNotes: row.interview_notes,
  socioeconomicData: row.socioeconomic_data,
  lifeHistory: row.life_history,
  createdAt: row.created_at,
})

/** Visit history, most recent visit first. */
export function listVisits({ limit }: { limit?: number } = {}): Visit[] {
  const sql = `SELECT * FROM visits ORDER BY visit_date DESC, id DESC ${limit ? 'LIMIT ?' : ''}`
  const rows = getDb().prepare(sql).all(...(limit ? [limit] : [])) as VisitRow[]
  return rows.map(toVisit)
}

export function getVisit(id: number): Visit | null {
  const row = getDb().prepare('SELECT * FROM visits WHERE id = ?').get(id) as VisitRow | undefined
  return row ? toVisit(row) : null
}

export function createVisit(input: VisitInput): Visit {
  const result = getDb()
    .prepare(`INSERT INTO visits (client_name, visit_date, interview_notes, socioeconomic_data, life_history)
      VALUES (@clientName, @visitDate, @interviewNotes, @socioeconomicData, @lifeHistory)`)
    .run(input)
  return getVisit(Number(result.lastInsertRowid)) as Visit
}

export function deleteVisit(id: number): void {
  getDb().prepare('DELETE FROM visits WHERE id = ?').run(id)
}
