import type { ReportSection } from '@/lib/reportSchema'
import styles from './ReportSections.module.css'

const ReportSectionHeader = ({ section }: { section: ReportSection }) => (
    <div className={styles.sectionHeader}>
        <span className={styles.number} aria-hidden>{section.number}</span>
        <div>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <p className={styles.sectionSubtitle}>{section.subtitle}</p>
            {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
        </div>
    </div>
)

export default ReportSectionHeader
