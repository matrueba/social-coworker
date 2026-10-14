import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import PageHeader from '@/components/ui/PageHeader'
import ReportList from '@/components/reports/ReportList'
import { REPORT_STATUSES, listReports, type ReportStatus } from '@/lib/db/reports'
import styles from './reports.module.css'

export const dynamic = 'force-dynamic'

interface ReportsPageProps {
    searchParams: Promise<{ q?: string; status?: string }>
}

const isStatus = (value: string | undefined): value is ReportStatus =>
    REPORT_STATUSES.some((status) => status === value)

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const { q, status } = await searchParams
    const search = q?.trim() || undefined
    const activeStatus = isStatus(status) ? status : undefined
    const reports = listReports({ search, status: activeStatus })
    const filtered = Boolean(search || activeStatus)

    return (
        <div className="page">
            <PageHeader
                eyebrow="Casos"
                title="Casos"
                description="Consulta, busca y gestiona todos los Casos guardados."
                actions={<Link href="/create-report" className="btn btnPrimary"><Icon name="plus" /> Nuevo Caso</Link>}
            />

            <form className={styles.filters} role="search">
                <input
                    type="search"
                    name="q"
                    defaultValue={search}
                    placeholder="Buscar por título, cliente o notas…"
                    className={styles.search}
                    aria-label="Buscar casos"
                />
                <select name="status" defaultValue={activeStatus ?? ''} className={styles.select} aria-label="Filtrar por estado">
                    <option value="">Todos los estados</option>
                    {REPORT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <button type="submit" className="btn btnPrimary"><Icon name="search" /> Filtrar</button>
                {filtered && <Link href="/reports" className="btn btnGhost">Limpiar</Link>}
            </form>

            <p className={styles.count}>{reports.length} {reports.length === 1 ? 'caso' : 'casos'}</p>
            <ReportList
                reports={reports}
                emptyMessage={filtered ? 'Ningún caso coincide con el filtro.' : 'Todavía no hay casos.'}
            />
        </div>
    )
}
