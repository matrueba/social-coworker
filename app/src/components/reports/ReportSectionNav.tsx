import { REPORT_SECTIONS } from '@/lib/reportSchema'
import styles from './ReportSections.module.css'

/** Índice de las secciones del informe (enlaces ancla). */
const ReportSectionNav = () => (
    <nav className={styles.nav} aria-label="Secciones del informe">
        {REPORT_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className={styles.navLink}>
                <span className={styles.navNumber}>{section.number}</span>
                {section.title}
            </a>
        ))}
    </nav>
)

export default ReportSectionNav
