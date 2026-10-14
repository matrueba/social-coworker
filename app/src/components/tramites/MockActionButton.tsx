'use client'

import { useState } from 'react'
import Icon, { type IconName } from '@/components/ui/Icon'

interface MockActionButtonProps {
    label: string
    icon: IconName
    variant?: 'primary' | 'ghost'
}

/** Botón de trámite simulado: aún no llama a la API de la administración. */
const MockActionButton = ({ label, icon, variant = 'ghost' }: MockActionButtonProps) => {
    const [sent, setSent] = useState(false)

    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
                type="button"
                className={`btn ${variant === 'primary' ? 'btnPrimary' : 'btnGhost'}`}
                onClick={() => setSent(true)}
            >
                <Icon name={sent ? 'check' : icon} /> {label}
            </button>
            {sent && (
                <span role="status" style={{ fontSize: '0.75rem', color: 'var(--muted)', maxWidth: '24ch' }}>
                    Simulado: aún no se envía a la administración.
                </span>
            )}
        </span>
    )
}

export default MockActionButton
