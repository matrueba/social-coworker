import { getDb } from './client'

export interface DashboardStats {
  visitsTotal: number
  visitsThisMonth: number
  clientsTotal: number
}

/** Cross-entity counters for the home dashboard (visits + reports). */
export function getDashboardStats(): DashboardStats {
  const db = getDb()
  const { visitsTotal, visitsThisMonth } = db
    .prepare(
      `SELECT COUNT(*) AS visitsTotal,
              COUNT(CASE WHEN substr(visit_date, 1, 7) = strftime('%Y-%m', 'now', 'localtime') THEN 1 END) AS visitsThisMonth
       FROM visits`,
    )
    .get() as { visitsTotal: number; visitsThisMonth: number }
  const { clientsTotal } = db
    .prepare(
      `SELECT COUNT(*) AS clientsTotal FROM (
         SELECT lower(trim(client_name)) FROM visits
         UNION
         SELECT lower(trim(client_name)) FROM reports
       )`,
    )
    .get() as { clientsTotal: number }
  return { visitsTotal, visitsThisMonth, clientsTotal }
}
