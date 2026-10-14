import PageHeader from '@/components/ui/PageHeader'
import ReportForm from '@/components/reports/ReportForm'
import { createReportAction } from '@/app/reports/actions'
import { getVisitOptions } from '@/lib/visitOptions'

export const dynamic = 'force-dynamic'

export default function CreateReportPage() {
    return (
        <div className="page">
            <PageHeader
                eyebrow="Nuevo"
                title="Crear nuevo informe"
                description="Informe técnico estructurado en 7 secciones. Solo el resumen del caso y el motivo de consulta son obligatorios."
            />
            <ReportForm visits={getVisitOptions()} action={createReportAction} />
        </div>
    )
}
