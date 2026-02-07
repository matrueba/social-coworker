import Link from 'next/link';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                Social Copilot
            </div>
            <nav className={styles.nav}>
                <Link href="/" className={styles.link}>
                    Inicio
                </Link>
                <Link href="/create-report" className={styles.link}>
                    Crear Informe
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
