import Icon, { type IconName } from './Icon'
import styles from './StatCards.module.css'

export interface StatItem {
    label: string
    value: number
    icon: IconName
    tone: 'primary' | 'secondary' | 'warning'
    hint?: string
}

/** Fila de indicadores numéricos del panel. */
const StatCards = ({ items }: { items: StatItem[] }) => (
    <section className={styles.grid} aria-label="Resumen">
        {items.map((item) => (
            <div key={item.label} className={`${styles.card} ${styles[item.tone]}`}>
                <span className={styles.icon}>
                    <Icon name={item.icon} size={20} />
                </span>
                <span className={styles.value}>{item.value}</span>
                <span className={styles.label}>{item.label}</span>
                {item.hint && <span className={styles.hint}>{item.hint}</span>}
            </div>
        ))}
    </section>
)

export default StatCards
