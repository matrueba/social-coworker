import Link from 'next/link'

export default function VisitNotFound() {
    return (
        <div className="page">
            <h1>Visita no encontrada</h1>
            <p style={{ color: 'var(--muted)', margin: '0.5rem 0 1.5rem' }}>Puede que haya sido eliminada.</p>
            <Link href="/visits" className="btn btnPrimary">Ver visitas</Link>
        </div>
    )
}
