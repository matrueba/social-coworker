import Link from 'next/link'
import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'
import styles from './Panel.module.css'

interface PanelProps {
    title: string
    icon: IconName
    href?: string
    linkLabel?: string
    children: ReactNode
}

/** Bloque del panel con cabecera (icono, título y enlace opcional). */
const Panel = ({ title, icon, href, linkLabel = 'Ver todos', children }: PanelProps) => (
    <section className={styles.panel}>
        <header className={styles.header}>
            <h2 className={styles.title}>
                <span className={styles.icon}><Icon name={icon} size={18} /></span>
                {title}
            </h2>
            {href && (
                <Link href={href} className={styles.link}>
                    {linkLabel} <Icon name="arrowRight" size={16} />
                </Link>
            )}
        </header>
        {children}
    </section>
)

export default Panel
