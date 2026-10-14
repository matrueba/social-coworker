import { getDb } from './client'
import {
  REPORT_STATUSES,
  parseStoredContent,
  reportInputSchema,
  type Report,
  type ReportInput,
  type ReportStats,
  type ReportSource,
  type ReportStatus,
} from '../reportSchema'

export { REPORT_STATUSES, reportInputSchema }
export type { Report, ReportInput, ReportStats, ReportStatus }

interface ReportRow {
  id: number
  title: string
  client_name: string
  status: ReportStatus
  visit_id: number | null
  content: string
  source: ReportSource
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

const toReport = (row: ReportRow): Report => ({
  id: row.id,
  title: row.title,
  clientName: row.client_name,
  status: row.status,
  visitId: row.visit_id,
  content: parseStoredContent(row.content),
  source: row.source,
  confirmedAt: row.confirmed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export interface ListReportsOptions {
  search?: string
  status?: ReportStatus
  visitId?: number
  limit?: number
}

/** Lists reports, newest first, optionally filtered by text and status. */
export function listReports({ search, status, visitId, limit }: ListReportsOptions = {}): Report[] {
  const where: string[] = []
  const params: Record<string, string | number> = {}
  if (search) {
    where.push('(title LIKE @q OR client_name LIKE @q OR content LIKE @q)')
    params.q = `%${search}%`
  }
  if (status) {
    where.push('status = @status')
    params.status = status
  }
  if (visitId) {
    where.push('visit_id = @visitId')
    params.visitId = visitId
  }
  const sql = `SELECT * FROM reports ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY created_at DESC, id DESC ${limit ? 'LIMIT @limit' : ''}`
  if (limit) params.limit = limit
  return (getDb().prepare(sql).all(params) as ReportRow[]).map(toReport)
}

export function getReport(id: number): Report | null {
  const row = getDb().prepare('SELECT * FROM reports WHERE id = ?').get(id) as ReportRow | undefined
  return row ? toReport(row) : null
}

/**
 * Inserts a report. Manual reports are confirmed on creation; AI reports are stored
 * as drafts (confirmed_at NULL) until a person reviews and confirms them.
 */
export function createReport(input: ReportInput, source: ReportSource = 'manual'): Report {
  const result = getDb()
    .prepare(`INSERT INTO reports (title, client_name, status, visit_id, content, source, confirmed_at)
      VALUES (@title, @clientName, @status, @visitId, @content, @source,
              CASE WHEN @source = 'manual' THEN datetime('now') END)`)
    .run({ ...input, content: JSON.stringify(input.content), source })
  return getReport(Number(result.lastInsertRowid)) as Report
}

/** Saves the reviewed content of a draft and marks it as confirmed. */
export function confirmReport(id: number, input: ReportInput): void {
  getDb()
    .prepare(`UPDATE reports
      SET title = @title, client_name = @clientName, status = @status, visit_id = @visitId,
          content = @content, confirmed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = @id`)
    .run({ ...input, content: JSON.stringify(input.content), id })
}

export function updateReportStatus(id: number, status: ReportStatus): void {
  getDb().prepare("UPDATE reports SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id)
}

export function deleteReport(id: number): void {
  getDb().prepare('DELETE FROM reports WHERE id = ?').run(id)
}

export function getReportStats(): ReportStats {
  const db = getDb()
  const byStatus: Record<ReportStatus, number> = { Pendiente: 0, 'En Progreso': 0, Completo: 0 }
  // Drafts are not reports yet: they are counted apart until confirmed
  const rows = db
    .prepare('SELECT status, COUNT(*) AS n FROM reports WHERE confirmed_at IS NOT NULL GROUP BY status')
    .all() as { status: ReportStatus; n: number }[]
  for (const row of rows) byStatus[row.status] = row.n
  const { drafts } = db.prepare('SELECT COUNT(*) AS drafts FROM reports WHERE confirmed_at IS NULL').get() as { drafts: number }
  return { total: rows.reduce((sum, r) => sum + r.n, 0), byStatus, drafts }
}
