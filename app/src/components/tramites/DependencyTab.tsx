import Link from 'next/link'
import Icon from '@/components/ui/Icon'
import StatCards from '@/components/ui/StatCards'
import DependencyCaseDetail from './DependencyCaseDetail'
import DependencyStatusBadge from './DependencyStatusBadge'
import {
    DEPENDENCY_STATUSES,
    getDependencySummary,
    searchDependencyCases,
    type DependencyStatus,
} from '@/lib/tramites/dependencyApi'
import styles from './Dependency.module.css'

interface DependencyTabProps {
    query?: string
    status?: string
    selectedId?: string
}

const isDependencyStatus = (value: string | undefined): value is DependencyStatus =>
    DEPENDENCY_STATUSES.some((s) => s === value)

/** Pestaña "Gestión de dependencia": consulta de expedientes del SAAD (datos simulados). */
const DependencyTab = async ({ query, status, selectedId }: DependencyTabProps) => {
    const activeStatus = isDependencyStatus(status) ? status : undefined
    const [summary, cases] = await Promise.all([getDependencySummary(), searchDependencyCases(query, activeStatus)])
    const selected = cases.find((c) => c.id === selectedId) ?? cases[0]

    const hrefFor = (id: string) => {
        const params = new URLSearchParams({ tab: 'dependencia', exp: id })
        if (query) params.set('q', query)
        if (activeStatus) params.set('status', activeStatus)
        return `/tramites?${params}`
    }

    return (
        <div>
            <div className={styles.mockNotice} role="note">
                <Icon name="alert" size={18} />
                <p>
                    <strong>Datos simulados.</strong> Esta pestaña aún no está conectada a la API del Sistema para la Autonomía y
                    Atención a la Dependencia (SAAD). Los expedientes y las personas son ficticios.
                </p>
            </div>

            <StatCards
                items={[
                    { label: 'Expedientes', value: summary.total, icon: 'folder', tone: 'primary' },
                    { label: 'Pendientes de valoración', value: summary.pendingAssessment, icon: 'clock', tone: 'warning' },
                    { label: 'PIA en elaboración', value: summary.pendingPia, icon: 'report', tone: 'secondary' },
                    { label: 'Con documentación pendiente', value: summary.withPendingDocuments, icon: 'file', tone: 'warning' },
                ]}
            />

            <form className={styles.filters} role="search">
                <input type="hidden" name="tab" value="dependencia" />
                <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Buscar por nombre, nº de expediente o municipio…"
                    className={styles.search}
                    aria-label="Buscar expedientes"
                />
                <select name="status" defaultValue={activeStatus ?? ''} className={styles.search} style={{ flex: '0 1 240px' }} aria-label="Filtrar por estado">
                    <option value="">Todos los estados</option>
                    {DEPENDENCY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" className="btn btnPrimary"><Icon name="search" /> Consultar</button>
                {(query || activeStatus) && <Link href="/tramites?tab=dependencia" className="btn btnGhost">Limpiar</Link>}
            </form>

            {cases.length === 0 ? (
                <p className={styles.empty}>No se han encontrado expedientes con esos criterios.</p>
            ) : (
                <div className={styles.layout}>
                    <ul className={styles.caseList} aria-label="Expedientes">
                        {cases.map((c) => (
                            <li key={c.id}>
                                <Link
                                    href={hrefFor(c.id)}
                                    className={`${styles.caseItem} ${c.id === selected?.id ? styles.caseItemActive : ''}`}
                                    aria-current={c.id === selected?.id ? 'true' : undefined}
                                    scroll={false}
                                >
                                    <span className={styles.caseName}>{c.applicantName}</span>
                                    <span className={styles.caseMeta}>{c.id} · {c.municipality}</span>
                                    <span className={styles.caseFooter}>
                                        <DependencyStatusBadge status={c.status} />
                                        {c.grade && c.grade !== 'Sin grado' && <span className={styles.gradeChip}>{c.grade}</span>}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {selected && <DependencyCaseDetail dependencyCase={selected} />}
                </div>
            )}
        </div>
    )
}

export default DependencyTab
