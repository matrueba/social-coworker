import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import PageHeader from '@/components/ui/PageHeader'
import ReportContentView from '@/components/reports/ReportContentView'
import ReportSectionNav from '@/components/reports/ReportSectionNav'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatLocalDateTime } from '@/lib/format'
import { REPORT_STATUSES, getReport } from '@/lib/db/reports'
import { getVisit } from '@/lib/db/visits'
import { isDraft } from '@/lib/reportSchema'
import { deleteReportAction, updateReportStatusAction } from '../actions'
import styles from '../reports.module.css'

export const dynamic = 'force-dynamic'

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const numericId = Number(id)
    const report = Number.isInteger(numericId) ? getReport(numericId) : null
    if (!report) notFound()
    if (isDraft(report)) redirect(`/reports/${report.id}/review`)
    const visit = report.visitId ? getVisit(report.visitId) : null

    return (
        <div className="page">
            <Link href="/reports" className={styles.back}><Icon name="arrowLeft" /> Volver a casos</Link>
            <PageHeader eyebrow={`Informe #${report.id}`} title={report.title} />

            <div className={styles.card} style={{ marginBottom: '1.25rem' }}>
                <div className={styles.meta} style={{ border: 0, padding: 0, margin: 0 }}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Cliente</span>
                        <strong>{report.clientName}</strong>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Estado</span>
                        <StatusBadge status={report.status} />
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Visita asociada</span>
                        {visit ? (
                            <Link href={`/visits/${visit.id}`} className={styles.metaLink}>
                                {formatLocalDateTime(visit.visitDate)} <Icon name="arrowRight" />
                            </Link>
                        ) : (
                            <span className={styles.metaMuted}>Ninguna</span>
                        )}
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Creado</span>
                        <span>{formatDate(report.createdAt)}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Actualizado</span>
                        <span>{formatDate(report.updatedAt)}</span>
                    </div>
                </div>
            </div>

            <ReportSectionNav />
            <ReportContentView content={report.content} />

            <div className={`${styles.card} ${styles.footer}`} style={{ marginTop: '1.25rem' }}>
                <form action={updateReportStatusAction} className={styles.statusForm}>
                    <input type="hidden" name="id" value={report.id} />
                    <select name="status" defaultValue={report.status} aria-label="Cambiar estado" className="btn btnGhost">
                        {REPORT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn btnPrimary">Actualizar estado</button>
                </form>
                <form action={deleteReportAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <button type="submit" className="btn btnDanger"><Icon name="trash" /> Eliminar</button>
                </form>
            </div>
        </div>
    )
}
