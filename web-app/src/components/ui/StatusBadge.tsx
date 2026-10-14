import type { ReportStatus } from '@/lib/reportSchema'
import styles from './StatusBadge.module.css'

const STATUS_CLASS: Record<ReportStatus, string> = {
    Completo: styles.completo,
    'En Progreso': styles.enProgreso,
    Pendiente: styles.pendiente,
}

const StatusBadge = ({ status }: { status: ReportStatus }) => (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>{status}</span>
)

export default StatusBadge

/** Distintivo de borrador generado por IA pendiente de revisión. */
export const DraftBadge = () => (
    <span className={`${styles.badge} ${styles.draft}`}>Borrador IA · por revisar</span>
)
