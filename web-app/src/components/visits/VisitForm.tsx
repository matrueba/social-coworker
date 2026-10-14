'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from '@/components/reports/ReportForm.module.css'
import { createVisitAction, type VisitFormState } from '@/app/visits/actions'

const INITIAL_STATE: VisitFormState = {}

/** Current local date and time in the format expected by `<input type="datetime-local">`. */
const nowLocal = () => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const TEXT_AREAS = [
    { name: 'interviewNotes', label: 'Notas de la entrevista', placeholder: 'Notas de campo, observaciones, criterio de evaluación...' },
    { name: 'socioeconomicData', label: 'Datos socioeconómicos', placeholder: 'Ingresos, vivienda, situación laboral, unidad de convivencia, ayudas recibidas…' },
    { name: 'lifeHistory', label: 'Historia de vida', placeholder: 'Trayectoria personal y familiar, hitos relevantes, situación actual…' },
]

const VisitForm = () => {
    const [state, formAction, pending] = useActionState(createVisitAction, INITIAL_STATE)
    const values = state.values
    const visitDateRef = useRef<HTMLInputElement>(null)

    // Set the default after mount so it uses the browser's time zone (avoids hydration mismatch)
    useEffect(() => {
        if (visitDateRef.current && !visitDateRef.current.value) visitDateRef.current.value = nowLocal()
    }, [])

    return (
        <form className={styles.formContainer} action={formAction}>
            {state.error && <p className={styles.error} role="alert">{state.error}</p>}

            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label htmlFor="clientName" className={styles.label}>Cliente / Beneficiario</label>
                    <input
                        type="text"
                        id="clientName"
                        name="clientName"
                        className={styles.input}
                        placeholder="Nombre completo"
                        defaultValue={values?.clientName}
                        maxLength={200}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="visitDate" className={styles.label}>Fecha y hora de la visita</label>
                    <input
                        type="datetime-local"
                        id="visitDate"
                        name="visitDate"
                        className={styles.input}
                        ref={visitDateRef}
                        defaultValue={values?.visitDate}
                        required
                    />
                </div>
            </div>

            {TEXT_AREAS.map((area) => (
                <div key={area.name} className={styles.formGroup}>
                    <label htmlFor={area.name} className={styles.label}>{area.label}</label>
                    <textarea
                        id={area.name}
                        name={area.name}
                        className={styles.textarea}
                        style={{ minHeight: 140 }}
                        placeholder={area.placeholder}
                        defaultValue={values?.[area.name]}
                        required
                    />
                </div>
            ))}

            <div className={styles.buttonGroup}>
                <button type="submit" className="btn btnPrimary" disabled={pending}>
                    {pending ? 'Guardando…' : 'Registrar Visita'}
                </button>
                <Link href="/visits" className="btn btnGhost">Cancelar</Link>
            </div>
        </form>
    )
}

export default VisitForm
