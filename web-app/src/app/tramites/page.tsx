import PageHeader from '@/components/PageHeader'
import Tabs, { type TabItem } from '@/components/Tabs'
import DependencyTab from '@/components/tramites/DependencyTab'

export const dynamic = 'force-dynamic'

const TABS: TabItem[] = [{ id: 'dependencia', label: 'Gestión de dependencia', icon: 'users', badge: 'Datos simulados' }]

interface TramitesPageProps {
    searchParams: Promise<{ tab?: string; q?: string; status?: string; exp?: string }>
}

export default async function TramitesPage({ searchParams }: TramitesPageProps) {
    const { tab, q, status, exp } = await searchParams
    const activeTab = TABS.some((t) => t.id === tab) ? (tab as string) : TABS[0].id

    return (
        <div className="page">
            <PageHeader
                eyebrow="Trámites"
                title="Trámites con la administración"
                description="Agiliza gestiones y consulta información directamente desde las APIs de la administración pública."
            />
            <Tabs tabs={TABS} activeId={activeTab} hrefFor={(id) => `/tramites?tab=${id}`} />
            {activeTab === 'dependencia' && <DependencyTab query={q?.trim() || undefined} status={status} selectedId={exp} />}
        </div>
    )
}
