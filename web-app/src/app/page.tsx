import Panel from '@/components/Panel'
import PageHeader from '@/components/PageHeader'
import ReportList from '@/components/ReportList'
import StatCards, { type StatItem } from '@/components/StatCards'
import StatusBreakdown from '@/components/StatusBreakdown'
import VisitList from '@/components/VisitList'
import { getDashboardStats } from '@/lib/db/dashboard'
import { getReportStats, listReports } from '@/lib/db/reports'
import { listVisits } from '@/lib/db/visits'

export const dynamic = 'force-dynamic'

const RECENT_LIMIT = 4

const todayLabel = () =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

export default function Home() {
  const dashboard = getDashboardStats()
  const reportStats = getReportStats()
  const recentVisits = listVisits({ limit: RECENT_LIMIT })
  const recentReports = listReports({ limit: RECENT_LIMIT })

  const stats: StatItem[] = [
    { label: 'Visitas registradas', value: dashboard.visitsTotal, icon: 'visit', tone: 'primary', hint: `${dashboard.visitsThisMonth} este mes` },
    { label: 'Casos', value: reportStats.total, icon: 'report', tone: 'secondary', hint: `${reportStats.byStatus.Completo} completados` },
    { label: 'Casos pendientes', value: reportStats.byStatus.Pendiente, icon: 'clock', tone: 'warning', hint: reportStats.drafts ? `${reportStats.drafts} borradores IA por revisar` : undefined },
    { label: 'Clientes atendidos', value: dashboard.clientsTotal, icon: 'users', tone: 'primary' },
  ]

  return (
    <div className="page">
      <PageHeader
        eyebrow={todayLabel()}
        title="Hola, Trabajador Social"
        description="Aquí tienes un resumen de tu actividad reciente."
      />

      <StatCards items={stats} />

      <div className="twoColumns">
        <Panel title="Últimas visitas" icon="visit" href="/visits">
          <VisitList visits={recentVisits} compact showCreateAction={false} />
        </Panel>
        <Panel title="Últimos casos" icon="report" href="/reports">
          <StatusBreakdown stats={reportStats} />
          <ReportList reports={recentReports} compact showCreateAction={false} />
        </Panel>
      </div>
    </div>
  )
}
