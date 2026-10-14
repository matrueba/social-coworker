import ChatWindow from '@/components/ChatWindow'
import PageHeader from '@/components/PageHeader'

export default function ChatPage() {
    return (
        <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PageHeader
                eyebrow="Demo · datos simulados"
                title="Chat RAG"
                description="Consulta tu base de conocimiento usando lenguaje natural."
            />
            <div style={{ flex: 1, minHeight: 0 }}>
                <ChatWindow />
            </div>
        </div>
    )
}
