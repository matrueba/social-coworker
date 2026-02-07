import styles from './ReportList.module.css';
import { Report } from '../data/mocks';

interface ReportListProps {
    reports: Report[];
}

const ReportList = ({ reports }: ReportListProps) => {
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Completo': return styles.statusCompleto;
            case 'En Progreso': return styles.statusEnProgreso;
            case 'Pendiente': return styles.statusPendiente;
            default: return '';
        }
    };

    return (
        <section className={styles.container}>
            <h2 className={styles.title}>Últimos Informes Generados</h2>
            <div className={styles.list}>
                {reports.map((report) => (
                    <div key={report.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.reportTitle}>{report.title}</h3>
                            <span className={`${styles.status} ${getStatusClass(report.status)}`}>
                                {report.status}
                            </span>
                        </div>
                        <div className={styles.details}>
                            <span>👤 {report.clientName}</span>
                            <span>📅 {report.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ReportList;
