import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import PageHeader from '@/components/ui/PageHeader'
import ReportForm from '@/components/reports/ReportForm'
import { getReport } from '@/lib/db/reports'
import { reportToFormValues } from '@/lib/reportFormData'
import { isDraft } from '@/lib/reportSchema'
import { getVisitOptions } from '@/lib/visitOptions'
import { confirmReportAction, discardDraftAction } from '../../actions'
import styles from '../../reports.module.css'

export const dynamic = 'force-dynamic'

export default async function ReviewDraftPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const numericId = Number(id)
    const report = Number.isInteger(numericId) ? getReport(numericId) : null
    if (!report) notFound()
    if (!isDraft(report)) redirect(`/reports/${report.id}`)

    return (
        <div className="page">
            <Link href={report.visitId ? `/visits/${report.visitId}` : '/reports'} className={styles.back}>
                <Icon name="arrowLeft" /> {report.visitId ? 'Volver a la visita' : 'Volver a casos'}
            </Link>
            <PageHeader
                eyebrow="Borrador generado con IA"
                title="Revisar y confirmar informe"
                actions={
                    <form action={discardDraftAction}>
                        <input type="hidden" name="id" value={report.id} />
                        <button type="submit" className="btn btnDanger"><Icon name="trash" /> Descartar borrador</button>
                    </form>
                }
            />

            <div className={styles.aiNotice} role="note">
                <Icon name="sparkles" size={20} />
                <p>
                    Este informe lo ha redactado la IA a partir de la visita. <strong>Revisa cada sección</strong>, corrige lo
                    necesario y confirma. Puede contener errores u omisiones, y los enlaces o recursos que cite deben
                    verificarse. Hasta que lo confirmes no cuenta como informe.
                </p>
            </div>

            <ReportForm
                visits={getVisitOptions()}
                action={confirmReportAction.bind(null, report.id)}
                initialValues={reportToFormValues(report)}
                submitLabel="Confirmar informe"
                cancelHref={report.visitId ? `/visits/${report.visitId}` : '/reports'}
            />
        </div>
    )
}
