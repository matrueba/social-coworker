import type { DependencyStatus } from '@/lib/tramites/dependencyApi'
import styles from '../StatusBadge.module.css'

const TONE: Record<DependencyStatus, string> = {
    'Solicitud registrada': styles.enProgreso,
    'Pendiente de valoración': styles.pendiente,
    Valorado: styles.enProgreso,
    'PIA en elaboración': styles.enProgreso,
    Resuelto: styles.completo,
    'En revisión de grado': styles.pendiente,
}

const DependencyStatusBadge = ({ status }: { status: DependencyStatus }) => (
    <span className={`${styles.badge} ${TONE[status]}`}>{status}</span>
)

export default DependencyStatusBadge
