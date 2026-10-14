import { REPORT_SECTIONS, type ReportContent } from '@/lib/reportSchema'
import ReportSectionHeader from './ReportSectionHeader'
import styles from './ReportSections.module.css'

/** Vista de solo lectura de las 7 secciones del informe. */
const ReportContentView = ({ content }: { content: ReportContent }) => (
    <div className={styles.stack}>
        {REPORT_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className={styles.section}>
                <ReportSectionHeader section={section} />
                <div className={styles.grid}>
                    {section.fields.map((field) => {
                        const value = content[field.key]
                        return (
                            <div
                                key={field.key}
                                className={`${styles.field} ${field.half ? styles.half : ''} ${field.tone ? styles[field.tone] : ''}`}
                            >
                                <h3 className={styles.fieldLabel}>
                                    {field.tone && <span className={styles.toneDot} aria-hidden />}
                                    {field.label}
                                </h3>
                                <p className={`${styles.value} ${value ? '' : styles.empty}`}>
                                    {value || 'Sin información'}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </section>
        ))}
    </div>
)

export default ReportContentView
