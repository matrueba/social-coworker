import Link from 'next/link'
import styles from '@/components/reports/ReportList.module.css'
import Icon from '@/components/ui/Icon'
import { formatLocalDateTime } from '@/lib/format'
import type { Visit } from '@/lib/visitSchema'

interface VisitListProps {
    visits: Visit[]
    showCreateAction?: boolean
    compact?: boolean
}

const initials = (name: string) =>
    name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')

const VisitList = ({ visits, showCreateAction = true, compact = false }: VisitListProps) => {
    if (visits.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}><Icon name="visit" size={24} /></span>
                <p>Todavía no hay visitas registradas.</p>
                {showCreateAction && (
                    <Link href="/visits/new" className="btn btnPrimary"><Icon name="plus" /> Registrar visita</Link>
                )}
            </div>
        )
    }

    return (
        <ul className={`${styles.list} ${compact ? styles.compact : ''}`}>
            {visits.map((visit) => (
                <li key={visit.id}>
                    <Link href={`/visits/${visit.id}`} className={styles.card}>
                        <div className={styles.avatar} aria-hidden>{initials(visit.clientName)}</div>
                        <div className={styles.body}>
                            <h3 className={styles.itemTitle}>{visit.clientName}</h3>
                            <p className={styles.excerpt}>{visit.interviewNotes}</p>
                            <div className={styles.details}>
                                <time dateTime={visit.visitDate} className={styles.meta}>
                                    <Icon name="clock" /> Visita del {formatLocalDateTime(visit.visitDate)}
                                </time>
                            </div>
                        </div>
                        <span className={styles.chevron}><Icon name="arrowRight" size={18} /></span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default VisitList
