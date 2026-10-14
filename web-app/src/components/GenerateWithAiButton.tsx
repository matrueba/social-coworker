'use client'

import { useActionState } from 'react'
import Icon from './Icon'
import styles from './GenerateWithAiButton.module.css'
import { generateReportAction, type GenerateReportState } from '@/app/visits/actions'

const INITIAL_STATE: GenerateReportState = {}

/** Genera un borrador de informe con IA a partir de la visita y abre la pantalla de revisión. */
const GenerateWithAiButton = ({ visitId }: { visitId: number }) => {
    const [state, formAction, pending] = useActionState(generateReportAction, INITIAL_STATE)

    return (
        <form action={formAction} className={styles.wrapper}>
            <input type="hidden" name="visitId" value={visitId} />
            <button type="submit" className="btn btnPrimary" disabled={pending} aria-busy={pending}>
                {pending ? <span className={styles.spinner} aria-hidden /> : <Icon name="sparkles" />}
                {pending ? 'Generando informe…' : 'Generar con IA'}
            </button>
            {pending && (
                <p className={styles.notice} role="status">
                    El agente está analizando la visita. Puede tardar un par de minutos; no cierres la página.
                </p>
            )}
            {!pending && state.error && <p className={styles.error} role="alert">{state.error}</p>}
        </form>
    )
}

export default GenerateWithAiButton
