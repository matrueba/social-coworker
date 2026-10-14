import Link from 'next/link'

export default function ReportNotFound() {
    return (
        <div className="page">
            <h1>Informe no encontrado</h1>
            <p style={{ color: 'var(--muted)', margin: '0.5rem 0 1.5rem' }}>Puede que haya sido eliminado.</p>
            <Link href="/reports" className="btn btnPrimary">Ver casos</Link>
        </div>
    )
}
