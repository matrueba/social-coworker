'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import { getDocuments } from '@/data/mocks';

export default function UploadDocumentsPage() {
    const [documents, setDocuments] = useState(getDocuments());

    return (
        <div className="page">
            <PageHeader
                eyebrow="Demo · datos simulados"
                title="Subir Documentos"
                description="Sube y gestiona los documentos asociados a tus casos."
            />

            <DocumentUpload
                onDocumentAdded={() => {
                    setDocuments(getDocuments());
                }}
            />

            <DocumentList documents={documents} />
        </div>
    );
}
