// Mocks de las secciones aún no implementadas: Subir Documentos y Chat RAG.

// ── Documentos (simulación SQL) ──

export interface Document {
    id: string;
    name: string;
    type: 'PDF' | 'Word' | 'Imagen' | 'Excel' | 'Otro';
    size: string;
    uploadDate: string;
    clientName: string;
    status: 'Procesado' | 'Pendiente' | 'Error';
}

let nextDocId = 6;

const mockDocuments: Document[] = [
    {
        id: '1',
        name: 'informe_social_452.pdf',
        type: 'PDF',
        size: '2.4 MB',
        uploadDate: '2023-10-25',
        clientName: 'María García',
        status: 'Procesado',
    },
    {
        id: '2',
        name: 'evaluacion_psicologica.docx',
        type: 'Word',
        size: '1.1 MB',
        uploadDate: '2023-10-24',
        clientName: 'Juan Pérez',
        status: 'Procesado',
    },
    {
        id: '3',
        name: 'foto_vivienda.jpg',
        type: 'Imagen',
        size: '3.8 MB',
        uploadDate: '2023-10-23',
        clientName: 'Familia López',
        status: 'Pendiente',
    },
    {
        id: '4',
        name: 'presupuesto_ayudas.xlsx',
        type: 'Excel',
        size: '540 KB',
        uploadDate: '2023-10-22',
        clientName: 'Pedro Rodriguez',
        status: 'Procesado',
    },
    {
        id: '5',
        name: 'certificado_empadronamiento.pdf',
        type: 'PDF',
        size: '890 KB',
        uploadDate: '2023-10-20',
        clientName: 'Ana Martínez',
        status: 'Error',
    },
];

/** Simula INSERT INTO documentos (...) VALUES (...) */
export function addDocument(doc: Omit<Document, 'id' | 'uploadDate' | 'status'>): Document {
    const newDoc: Document = {
        ...doc,
        id: String(nextDocId++),
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'Pendiente',
    };
    mockDocuments.unshift(newDoc);
    return newDoc;
}

/** Simula SELECT * FROM documentos ORDER BY upload_date DESC */
export function getDocuments(): Document[] {
    return [...mockDocuments];
}

// ── Chat RAG (simulación) ──

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sources?: string[];
}

let chatMsgId = 0;

const ragResponses: { keywords: string[]; answer: string; sources: string[] }[] = [
    {
        keywords: ['ayuda', 'social', 'prestación', 'prestacion'],
        answer:
            'Según la base de conocimiento, las prestaciones sociales disponibles incluyen:\n\n• **Renta Mínima de Inserción (RMI)**: Para unidades familiares sin ingresos suficientes.\n• **Ayudas de Emergencia Social**: Cubren necesidades básicas como alimentación, suministros y alquiler.\n• **Prestación por hijo a cargo**: Para familias con menores y rentas bajas.\n\nPuedo darte más detalles sobre cualquiera de estas prestaciones.',
        sources: ['guia_prestaciones_2023.pdf', 'normativa_servicios_sociales.pdf'],
    },
    {
        keywords: ['informe', 'caso', 'evaluación', 'evaluacion'],
        answer:
            'Para elaborar un informe de evaluación de caso, la documentación recomienda seguir esta estructura:\n\n1. **Datos identificativos** del usuario y la unidad de convivencia.\n2. **Motivo de intervención** y demanda explícita.\n3. **Diagnóstico social** con análisis de áreas (vivienda, empleo, salud, educación).\n4. **Plan de intervención** con objetivos, actividades y plazos.\n5. **Seguimiento y evaluación** de resultados.\n\nEl modelo estándar está disponible en la plantilla institucional.',
        sources: ['protocolo_informes_sociales.pdf', 'plantilla_evaluacion_v3.docx'],
    },
    {
        keywords: ['vivienda', 'alquiler', 'desahucio'],
        answer:
            'En situaciones de riesgo de pérdida de vivienda, la base de conocimiento indica los siguientes recursos:\n\n• **Servicio de mediación hipotecaria**: Negociación con entidades financieras.\n• **Ayuda al alquiler**: Subvenciones del 40% de la renta mensual (máx. 600€/mes).\n• **Alojamiento temporal**: Red de pisos de emergencia social (estancia máx. 6 meses).\n• **Asesoría jurídica gratuita**: Turno de oficio especializado en desahucios.\n\n⚠️ En caso de desahucio inminente, contactar con el servicio de urgencias sociales.',
        sources: ['protocolo_vivienda_2023.pdf', 'recursos_emergencia_habitacional.pdf'],
    },
    {
        keywords: ['menor', 'niño', 'niña', 'familia', 'protección', 'proteccion'],
        answer:
            'Respecto a la protección de menores, el protocolo establece:\n\n1. **Detección y notificación**: Cualquier profesional está obligado a comunicar situaciones de riesgo.\n2. **Valoración inicial**: En un plazo máximo de 72 horas.\n3. **Medidas de protección**: Desde apoyo familiar hasta tutela institucional, según la gravedad.\n4. **Coordinación interinstitucional**: Con salud, educación y fuerzas de seguridad.\n\nRecuerda que la prioridad absoluta es el interés superior del menor.',
        sources: ['ley_proteccion_menores.pdf', 'protocolo_desamparo.pdf'],
    },
    {
        keywords: ['empleo', 'trabajo', 'formación', 'formacion', 'inserción', 'insercion'],
        answer:
            'Para la inserción laboral, la base de conocimiento recoge estos recursos:\n\n• **Programas de empleo con apoyo**: Para personas con dificultades especiales de inserción.\n• **Itinerarios personalizados de empleo (IPE)**: Orientación, formación y acompañamiento.\n• **Empresas de inserción**: Empleo transitorio con formación integrada.\n• **Ayudas al autoempleo**: Subvenciones y microcréditos para emprendimiento social.\n\nLos derivadores pueden solicitar plaza a través del formulario interno.',
        sources: ['catalogo_recursos_empleo.pdf', 'guia_itinerarios_insercion.pdf'],
    },
];

const defaultResponse = {
    answer:
        'He buscado en la base de conocimiento pero no he encontrado información específica sobre ese tema. Puedo ayudarte con consultas sobre:\n\n• Prestaciones y ayudas sociales\n• Elaboración de informes y evaluaciones\n• Recursos de vivienda y emergencia habitacional\n• Protección de menores\n• Inserción laboral y formación\n\n¿Podrías reformular tu pregunta o indicarme sobre qué área necesitas información?',
    sources: [] as string[],
};

/** Simula una consulta RAG contra la base de conocimiento */
export function sendChatMessage(userMessage: string): Promise<ChatMessage> {
    return new Promise((resolve) => {
        const lower = userMessage.toLowerCase();
        const match = ragResponses.find((r) =>
            r.keywords.some((kw) => lower.includes(kw))
        ) ?? defaultResponse;

        setTimeout(() => {
            resolve({
                id: String(++chatMsgId),
                role: 'assistant',
                content: match.answer,
                timestamp: new Date().toISOString(),
                sources: match.sources,
            });
        }, 800 + Math.random() * 1200);
    });
}
