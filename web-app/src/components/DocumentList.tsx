import styles from './DocumentList.module.css';
import { Document } from '../data/mocks';
import Icon, { type IconName } from './Icon';

interface DocumentListProps {
    documents: Document[];
}

const typeIcons: Record<Document['type'], IconName> = {
    PDF: 'file',
    Word: 'report',
    Excel: 'sheet',
    Imagen: 'image',
    Otro: 'file',
};

const DocumentList = ({ documents }: DocumentListProps) => {
    const getStatusClass = (status: Document['status']) => {
        switch (status) {
            case 'Procesado': return styles.statusProcesado;
            case 'Pendiente': return styles.statusPendiente;
            case 'Error': return styles.statusError;
            default: return '';
        }
    };

    if (documents.length === 0) {
        return (
            <section className={styles.container}>
                <h2 className={styles.title}>Documentos Almacenados</h2>
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}><Icon name="folder" size={28} /></span>
                    <p>No hay documentos almacenados todavía.</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.container}>
            <h2 className={styles.title}>Documentos Almacenados</h2>
            <div className={styles.tableScroll}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Tamaño</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr key={doc.id}>
                            <td className={styles.fileName}>{doc.name}</td>
                            <td>
                                <span className={styles.fileType}>
                                    <Icon name={typeIcons[doc.type]} /> {doc.type}
                                </span>
                            </td>
                            <td>{doc.size}</td>
                            <td>{doc.uploadDate}</td>
                            <td>{doc.clientName}</td>
                            <td>
                                <span className={`${styles.status} ${getStatusClass(doc.status)}`}>
                                    {doc.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </section>
    );
};

export default DocumentList;
