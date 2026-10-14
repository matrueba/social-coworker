import Link from 'next/link'
import styles from './ReportList.module.css'
import Icon from './Icon'
import StatusBadge, { DraftBadge } from './StatusBadge'
import { formatDate } from '@/lib/format'
import { isDraft, type Report } from '@/lib/reportSchema'

interface ReportListProps {
    reports: Report[]
    emptyMessage?: string
    showCreateAction?: boolean
    compact?: boolean
}

const ReportList = ({ reports, emptyMessage = 'Todavía no hay casos.', showCreateAction = true, compact = false }: ReportListProps) => {
    if (reports.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}><Icon name="report" size={24} /></span>
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <ul className={`${styles.list} ${compact ? styles.compact : ''}`}>
            {reports.map((report) => (
                <li key={report.id}>
                    <Link href={isDraft(report) ? `/reports/${report.id}/review` : `/reports/${report.id}`} className={styles.card}>
                        <div className={`${styles.avatar} ${styles.avatarSecondary}`} aria-hidden>
                            <Icon name="report" size={20} />
                        </div>
                        <div className={styles.body}>
                            <h3 className={styles.itemTitle}>{report.title}</h3>
                            <div className={styles.details}>
                                <span className={styles.meta}><Icon name="user" /> {report.clientName}</span>
                                <span className={styles.meta}><Icon name="calendar" /> {formatDate(report.createdAt)}</span>
                            </div>
                        </div>
                        {isDraft(report) ? <DraftBadge /> : <StatusBadge status={report.status} />}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export default ReportList
