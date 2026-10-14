'use client'

import { useActionState, useRef } from 'react'
import Link from 'next/link'
import styles from './ReportForm.module.css'
import sectionStyles from './ReportSections.module.css'
import Icon from '@/components/ui/Icon'
import ReportSectionHeader from './ReportSectionHeader'
import ReportSectionNav from './ReportSectionNav'
import type { ReportFormState } from '@/app/reports/actions'
import { REPORT_SECTIONS, REPORT_STATUSES, REQUIRED_CONTENT_KEYS } from '@/lib/reportSchema'

export interface VisitOption {
    id: number
    clientName: string
    label: string
}

interface ReportFormProps {
    visits: VisitOption[]
    /** Server Action that receives the form (create, or confirm a reviewed draft). */
    action: (state: ReportFormState, formData: FormData) => Promise<ReportFormState>
    initialValues?: Record<string, string>
    submitLabel?: string
    cancelHref?: string
}

const FieldError = ({ message }: { message?: string }) =>
    message ? <p className={sectionStyles.fieldError} role="alert">{message}</p> : null

const ReportForm = ({
    visits,
    action,
    initialValues,
    submitLabel = 'Guardar informe',
    cancelHref = '/reports',
}: ReportFormProps) => {
    const [state, formAction, pending] = useActionState(action, { values: initialValues })
    const values = state.values
    const errors = state.fieldErrors ?? {}
    const clientNameRef = useRef<HTMLInputElement>(null)

    // Al elegir una visita, propone su cliente si el campo está vacío
    const handleVisitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const visit = visits.find((v) => String(v.id) === event.target.value)
        if (visit && clientNameRef.current && !clientNameRef.current.value.trim()) {
            clientNameRef.current.value = visit.clientName
        }
    }

    return (
        <form action={formAction} className={sectionStyles.stack} noValidate>
            {state.error && <p className={styles.error} role="alert">{state.error}</p>}

            <section className={sectionStyles.section}>
                <h2 className={sectionStyles.sectionTitle} style={{ marginBottom: '1rem' }}>Datos generales</h2>
                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>Título del informe <span className={sectionStyles.required}>*</span></label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className={styles.input}
                        placeholder="Ej: Valoración de dependencia — Visita domiciliaria"
                        defaultValue={values?.title}
                        maxLength={200}
                        aria-invalid={Boolean(errors.title)}
                    />
                    <FieldError message={errors.title} />
                </div>
                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label htmlFor="clientName" className={styles.label}>Cliente / Beneficiario <span className={sectionStyles.required}>*</span></label>
                        <input
                            ref={clientNameRef}
                            type="text"
                            id="clientName"
                            name="clientName"
                            className={styles.input}
                            placeholder="Nombre completo"
                            defaultValue={values?.clientName}
                            maxLength={200}
                            aria-invalid={Boolean(errors.clientName)}
                        />
                        <FieldError message={errors.clientName} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="status" className={styles.label}>Estado</label>
                        <select id="status" name="status" className={styles.input} defaultValue={values?.status || 'Pendiente'}>
                            {REPORT_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                    <label htmlFor="visitId" className={styles.label}>Visita asociada (opcional)</label>
                    <select
                        id="visitId"
                        name="visitId"
                        className={styles.input}
                        defaultValue={values?.visitId ?? ''}
                        onChange={handleVisitChange}
                    >
                        <option value="">Sin visita asociada</option>
                        {visits.map((visit) => (
                            <option key={visit.id} value={visit.id}>{visit.label}</option>
                        ))}
                    </select>
                </div>
            </section>

            <ReportSectionNav />

            {REPORT_SECTIONS.map((section) => (
                <fieldset key={section.id} id={section.id} className={sectionStyles.section}>
                    <legend className="srOnly">{`${section.number}. ${section.title}`}</legend>
                    <ReportSectionHeader section={section} />
                    <div className={sectionStyles.grid}>
                        {section.fields.map((field) => {
                            const required = REQUIRED_CONTENT_KEYS.has(field.key)
                            const hintId = field.hint ? `${field.key}-hint` : undefined
                            return (
                                <div
                                    key={field.key}
                                    className={`${sectionStyles.field} ${field.half ? sectionStyles.half : ''} ${field.tone ? sectionStyles[field.tone] : ''}`}
                                >
                                    <label htmlFor={field.key} className={sectionStyles.fieldLabel}>
                                        {field.tone && <span className={sectionStyles.toneDot} aria-hidden />}
                                        {field.label}
                                        {required && <span className={sectionStyles.required}>*</span>}
                                    </label>
                                    {field.hint && <p id={hintId} className={sectionStyles.hint}>{field.hint}</p>}
                                    <textarea
                                        id={field.key}
                                        name={field.key}
                                        className={styles.textarea}
                                        style={{ minHeight: 'auto' }}
                                        rows={field.rows ?? 3}
                                        defaultValue={values?.[field.key]}
                                        aria-describedby={hintId}
                                        aria-invalid={Boolean(errors[field.key])}
                                    />
                                    <FieldError message={errors[field.key]} />
                                </div>
                            )
                        })}
                    </div>
                </fieldset>
            ))}

            <div className={styles.actionBar}>
                <button type="submit" className="btn btnPrimary" disabled={pending}>
                    <Icon name="check" /> {pending ? 'Guardando…' : submitLabel}
                </button>
                <Link href={cancelHref} className="btn btnGhost">Cancelar</Link>
                <span className={styles.actionHint}><span className={sectionStyles.required}>*</span> Campos obligatorios</span>
            </div>
        </form>
    )
}

export default ReportForm
