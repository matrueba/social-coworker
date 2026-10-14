import type { ReportStats, ReportStatus } from '@/lib/reportSchema'
import { REPORT_STATUSES } from '@/lib/reportSchema'
import styles from './StatusBreakdown.module.css'

const STATUS_CLASS: Record<ReportStatus, string> = {
    Pendiente: styles.pendiente,
    'En Progreso': styles.enProgreso,
    Completo: styles.completo,
}

/** Barra segmentada con el reparto de informes por estado, con leyenda y recuentos. */
const StatusBreakdown = ({ stats }: { stats: ReportStats }) => {
    if (stats.total === 0) return null

    return (
        <div className={styles.wrapper}>
            <div className={styles.bar} role="img" aria-label={REPORT_STATUSES.map((s) => `${s}: ${stats.byStatus[s]}`).join(', ')}>
                {REPORT_STATUSES.filter((s) => stats.byStatus[s] > 0).map((status) => (
                    <span
                        key={status}
                        className={`${styles.segment} ${STATUS_CLASS[status]}`}
                        style={{ flexGrow: stats.byStatus[status] }}
                        title={`${status}: ${stats.byStatus[status]}`}
                    />
                ))}
            </div>
            <ul className={styles.legend}>
                {REPORT_STATUSES.map((status) => (
                    <li key={status}>
                        <span className={`${styles.swatch} ${STATUS_CLASS[status]}`} aria-hidden />
                        {status}
                        <strong>{stats.byStatus[status]}</strong>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default StatusBreakdown
