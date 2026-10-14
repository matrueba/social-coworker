'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon, { type IconName } from './Icon'
import styles from './Sidebar.module.css'

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
    { href: '/', label: 'Inicio', icon: 'home' },
    { href: '/visits', label: 'Visitas', icon: 'visit' },
    { href: '/reports', label: 'Casos', icon: 'report' },
    { href: '/tramites', label: 'Trámites', icon: 'landmark' },
    { href: '/upload-documents', label: 'Subir Documentos', icon: 'upload' },
    { href: '/chat', label: 'Chat RAG', icon: 'chat' },
]

const isActive = (pathname: string, href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/reports' && pathname === '/create-report') return true
    return pathname === href || pathname.startsWith(`${href}/`)
}

const Sidebar = () => {
    const pathname = usePathname()

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span className={styles.logoMark}><Icon name="sparkles" size={20} /></span>
                <span>Social Copilot</span>
            </div>
            <nav className={styles.nav} aria-label="Navegación principal">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(pathname, item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.link} ${active ? styles.active : ''}`}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon name={item.icon} size={19} className={styles.icon} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
            <p className={styles.footer}>Asistente para trabajadores sociales</p>
        </aside>
    )
}

export default Sidebar
