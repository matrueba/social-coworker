import ReportForm from '@/components/ReportForm';

export default function CreateReportPage() {
    return (
        <div style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                    Crear Nuevo Informe
                </h1>
                <p style={{ color: '#64748b' }}>
                    Registra los detalles y notas del caso.
                </p>
            </header>

            <ReportForm />
        </div>
    );
}
