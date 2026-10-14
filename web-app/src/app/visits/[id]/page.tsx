import Link from 'next/link'
import { notFound } from 'next/navigation'
import GenerateWithAiButton from '@/components/GenerateWithAiButton'
import Icon, { type IconName } from '@/components/Icon'
import PageHeader from '@/components/PageHeader'
import { formatDate, formatLocalDateTime } from '@/lib/format'
import { getVisit } from '@/lib/db/visits'
import { listReports } from '@/lib/db/reports'
import ReportList from '@/components/ReportList'
import { deleteVisitAction } from '../actions'
import styles from '../visits.module.css'

export const dynamic = 'force-dynamic'

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const numericId = Number(id)
    const visit = Number.isInteger(numericId) ? getVisit(numericId) : null
    if (!visit) notFound()
    const reports = listReports({ visitId: visit.id })

    const sections: { title: string; body: string; icon: IconName; wide?: boolean }[] = [
        { title: 'Notas de la entrevista', body: visit.interviewNotes, icon: 'notes', wide: true },
        { title: 'Datos socioeconómicos', body: visit.socioeconomicData, icon: 'wallet' },
        { title: 'Historia de vida', body: visit.lifeHistory, icon: 'book' },
    ]

    return (
        <div className="page">
            <Link href="/visits" className={styles.back}><Icon name="arrowLeft" /> Volver a visitas</Link>
            <PageHeader eyebrow={`Visita #${visit.id}`} title={visit.clientName} actions={<GenerateWithAiButton visitId={visit.id} />} />

            <div className={styles.chips}>
                <span className={styles.chip}><Icon name="calendar" /> {formatLocalDateTime(visit.visitDate)}</span>
                <span className={styles.chip}><Icon name="user" /> {visit.clientName}</span>
                <span className={styles.chipMuted}>Registrada el {formatDate(visit.createdAt)}</span>
            </div>

            <div className={styles.sections}>
                {sections.map((section) => (
                    <section key={section.title} className={`${styles.section} ${section.wide ? styles.wide : ''}`}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}><Icon name={section.icon} size={18} /></span>
                            {section.title}
                        </h2>
                        <p className={styles.sectionBody}>{section.body}</p>
                    </section>
                ))}
            </div>

            <section className={styles.related}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}><Icon name="report" size={18} /></span>
                    Casos de esta visita
                </h2>
                {reports.length > 0 ? (
                    <ReportList reports={reports} compact />
                ) : (
                    <p className={styles.relatedEmpty}>Aún no hay casos. Usa «Generar con IA» para crear un borrador a partir de esta visita.</p>
                )}
            </section>

            <div className={styles.footer}>
                <form action={deleteVisitAction}>
                    <input type="hidden" name="id" value={visit.id} />
                    <button type="submit" className="btn btnDanger"><Icon name="trash" /> Eliminar visita</button>
                </form>
            </div>
        </div>
    )
}
