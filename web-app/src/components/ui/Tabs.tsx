import Link from 'next/link'
import Icon, { type IconName } from './Icon'
import styles from './Tabs.module.css'

export interface TabItem {
    id: string
    label: string
    icon?: IconName
    badge?: string
}

interface TabsProps {
    tabs: TabItem[]
    activeId: string
    /** Builds the URL of each tab (the active tab lives in the URL so it can be shared and reloaded). */
    hrefFor: (id: string) => string
}

/** Barra de pestañas basada en enlaces. */
const Tabs = ({ tabs, activeId, hrefFor }: TabsProps) => (
    <nav className={styles.tabs} role="tablist">
        {tabs.map((tab) => {
            const active = tab.id === activeId
            return (
                <Link
                    key={tab.id}
                    href={hrefFor(tab.id)}
                    role="tab"
                    aria-selected={active}
                    className={`${styles.tab} ${active ? styles.active : ''}`}
                >
                    {tab.icon && <Icon name={tab.icon} size={17} />}
                    {tab.label}
                    {tab.badge && <span className={styles.badge}>{tab.badge}</span>}
                </Link>
            )
        })}
    </nav>
)

export default Tabs
