import Icon from '../Icon'
import MockActionButton from './MockActionButton'
import DependencyStatusBadge from './DependencyStatusBadge'
import type { DependencyCase } from '@/lib/tramites/dependencyApi'
import styles from './Dependency.module.css'

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const formatDay = (isoDate: string) => dateFormatter.format(new Date(`${isoDate}T00:00:00Z`))
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

const ageFrom = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const beforeBirthday = now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
    return now.getFullYear() - birth.getFullYear() - (beforeBirthday ? 1 : 0)
}

/** Tramos del Baremo de Valoración de la Dependencia (BVD). */
const BVD_BANDS = [
    { label: 'Sin grado', from: 0, to: 25 },
    { label: 'Grado I', from: 25, to: 50 },
    { label: 'Grado II', from: 50, to: 75 },
    { label: 'Grado III', from: 75, to: 100 },
]

const BvdMeter = ({ score }: { score: number }) => (
    <div className={styles.bvd}>
        <div className={styles.bvdTrack} role="img" aria-label={`Puntuación BVD: ${score} de 100`}>
            {BVD_BANDS.map((band) => (
                <span key={band.label} className={styles.bvdBand} data-active={score >= band.from && score < band.to + (band.to === 100 ? 1 : 0)} />
            ))}
            <span className={styles.bvdMarker} style={{ left: `${score}%` }} />
        </div>
        <div className={styles.bvdLabels} aria-hidden>
            {BVD_BANDS.map((band) => <span key={band.label}>{band.label}</span>)}
        </div>
    </div>
)

const DependencyCaseDetail = ({ dependencyCase: c }: { dependencyCase: DependencyCase }) => (
    <article className={styles.detail}>
        <header className={styles.detailHeader}>
            <div>
                <p className={styles.caseId}>{c.id}</p>
                <h2 className={styles.detailTitle}>{c.applicantName}</h2>
            </div>
            <DependencyStatusBadge status={c.status} />
        </header>

        <dl className={styles.facts}>
            <div><dt>DNI</dt><dd>{c.maskedId}</dd></div>
            <div><dt>Edad</dt><dd>{ageFrom(c.birthDate)} años</dd></div>
            <div><dt>Municipio</dt><dd>{c.municipality}</dd></div>
            <div><dt>Centro de servicios sociales</dt><dd>{c.socialServicesCenter}</dd></div>
            <div><dt>Solicitud</dt><dd>{formatDay(c.requestDate)}</dd></div>
            <div><dt>Última actualización</dt><dd>{formatDay(c.lastUpdate)}</dd></div>
        </dl>

        {c.nextDeadline && (
            <div className={styles.deadline}>
                <Icon name="alert" size={18} />
                <span><strong>{c.nextDeadline.label}</strong> · {formatDay(c.nextDeadline.date)}</span>
            </div>
        )}

        <section className={styles.block}>
            <h3 className={styles.blockTitle}>Grado reconocido</h3>
            {c.grade && c.bvdScore !== null ? (
                <>
                    <p className={styles.grade}>{c.grade} <span>· {c.bvdScore} puntos BVD</span></p>
                    <BvdMeter score={c.bvdScore} />
                </>
            ) : (
                <p className={styles.muted}>Pendiente de valoración.</p>
            )}
        </section>

        <section className={styles.block}>
            <h3 className={styles.blockTitle}>Tramitación</h3>
            <ol className={styles.timeline}>
                {c.timeline.map((s) => (
                    <li key={s.label} className={s.done ? styles.stepDone : styles.stepPending}>
                        <span className={styles.stepDot} aria-hidden>{s.done && <Icon name="check" size={12} strokeWidth={3} />}</span>
                        <div>
                            <p className={styles.stepLabel}>{s.label}</p>
                            <p className={styles.stepMeta}>{s.date ? formatDay(s.date) : 'Pendiente'}{s.description ? ` · ${s.description}` : ''}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>

        <section className={styles.block}>
            <h3 className={styles.blockTitle}>Servicios y prestaciones (PIA)</h3>
            {c.services.length > 0 ? (
                <ul className={styles.services}>
                    {c.services.map((service) => (
                        <li key={service.name}>
                            <div>
                                <p className={styles.serviceName}>{service.name}</p>
                                <p className={styles.stepMeta}>
                                    {service.kind}{service.provider ? ` · ${service.provider}` : ''}
                                    {service.monthlyAmount ? ` · ${euros.format(service.monthlyAmount)}/mes` : ''}
                                </p>
                            </div>
                            <span className={styles.serviceStatus} data-status={service.status}>{service.status}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.muted}>Sin servicios asignados todavía.</p>
            )}
        </section>

        <section className={styles.block}>
            <h3 className={styles.blockTitle}>Documentación pendiente</h3>
            {c.pendingDocuments.length > 0 ? (
                <ul className={styles.docs}>
                    {c.pendingDocuments.map((doc) => <li key={doc}><Icon name="file" /> {doc}</li>)}
                </ul>
            ) : (
                <p className={styles.muted}>No hay documentación pendiente.</p>
            )}
        </section>

        <footer className={styles.actions}>
            {c.pendingDocuments.length > 0 && <MockActionButton label="Aportar documentación" icon="upload" variant="primary" />}
            {c.grade && c.status !== 'En revisión de grado' && <MockActionButton label="Solicitar revisión de grado" icon="report" />}
            <MockActionButton label="Ver en sede electrónica" icon="external" />
        </footer>
    </article>
)

export default DependencyCaseDetail
