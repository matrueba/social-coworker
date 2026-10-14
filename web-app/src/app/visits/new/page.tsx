import PageHeader from '@/components/PageHeader'
import VisitForm from '@/components/VisitForm'

export default function NewVisitPage() {
    return (
        <div className="page">
            <PageHeader
                eyebrow="Nueva"
                title="Registrar visita"
                description="Recoge los datos de una visita física a un cliente."
            />
            <VisitForm />
        </div>
    )
}
