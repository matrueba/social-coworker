import Link from 'next/link';
import ReportList from '../components/ReportList';
import { recentReports } from '../data/mocks';

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '0.5rem' }}>
          Hola, Trabajador Social 👋
        </h1>
        <p style={{ color: '#64748b' }}>
          Aquí tienes un resumen de tu actividad reciente.
        </p>
      </header>

      <ReportList reports={recentReports} />

      <div style={{ marginTop: '2rem' }}>
        <Link
          href="/create-report"
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontWeight: 500
          }}
        >
          + Crear Nuevo Informe
        </Link>
      </div>
    </div>
  );
}
