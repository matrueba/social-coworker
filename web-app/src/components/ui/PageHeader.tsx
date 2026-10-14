import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
    title: string
    description?: string
    eyebrow?: string
    actions?: ReactNode
}

/** Cabecera común de página: título, descripción y acciones opcionales. */
const PageHeader = ({ title, description, eyebrow, actions }: PageHeaderProps) => (
    <header className={styles.header}>
        <div>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
    </header>
)

export default PageHeader
