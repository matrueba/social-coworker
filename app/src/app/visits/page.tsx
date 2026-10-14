import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import PageHeader from '@/components/ui/PageHeader'
import VisitList from '@/components/visits/VisitList'
import { listVisits } from '@/lib/db/visits'

export const dynamic = 'force-dynamic'

export default function VisitsPage() {
    const visits = listVisits()

    return (
        <div className="page">
            <PageHeader
                eyebrow="Visitas"
                title="Histórico de visitas"
                description="Visitas físicas registradas. Esta información alimentará al agente de IA."
                actions={<Link href="/visits/new" className="btn btnPrimary"><Icon name="plus" /> Registrar visita</Link>}
            />
            <VisitList visits={visits} />
        </div>
    )
}
