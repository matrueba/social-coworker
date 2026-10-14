'use client';

import { useState, useRef, DragEvent } from 'react';
import styles from './DocumentUpload.module.css';
import Icon from '@/components/ui/Icon';
import { addDocument, Document } from '@/data/mocks';

interface DocumentUploadProps {
    onDocumentAdded: (doc: Document) => void;
}

const DocumentUpload = ({ onDocumentAdded }: DocumentUploadProps) => {
    const [clientName, setClientName] = useState('');
    const [docType, setDocType] = useState<Document['type']>('PDF');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !clientName) return;

        const newDoc = addDocument({
            name: selectedFile.name,
            type: docType,
            size: formatFileSize(selectedFile.size),
            clientName,
        });

        onDocumentAdded(newDoc);
        setShowSuccess(true);
        setSelectedFile(null);
        setClientName('');
        setDocType('PDF');
        if (fileInputRef.current) fileInputRef.current.value = '';

        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <form className={styles.container} onSubmit={handleSubmit}>
            {showSuccess && (
                <div className={styles.successToast}>
                    <Icon name="check" /> Documento guardado correctamente en la base de datos
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Archivo</label>
                <div
                    className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <span className={styles.dropIcon}><Icon name="upload" size={26} /></span>
                    <p className={styles.dropText}>
                        Arrastra un archivo aquí o <strong>haz clic para seleccionar</strong>
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className={styles.hiddenInput}
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                </div>
                {selectedFile && (
                    <div className={styles.selectedFile}>
                        <span className={styles.fileIcon}><Icon name="paperclip" size={20} /></span>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileName}>{selectedFile.name}</div>
                            <div className={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
                        </div>
                        <button
                            type="button"
                            className={styles.removeFile}
                            onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                        >
                            <Icon name="close" />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="docClientName" className={styles.label}>
                    Cliente / Beneficiario
                </label>
                <input
                    type="text"
                    id="docClientName"
                    className={styles.input}
                    placeholder="Nombre del cliente asociado"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="docType" className={styles.label}>
                    Tipo de Documento
                </label>
                <select
                    id="docType"
                    className={styles.select}
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as Document['type'])}
                >
                    <option value="PDF">PDF</option>
                    <option value="Word">Word</option>
                    <option value="Excel">Excel</option>
                    <option value="Imagen">Imagen</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>

            <div className={styles.buttonGroup}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={!selectedFile || !clientName}
                >
                    <Icon name="upload" /> Subir Documento
                </button>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                        setSelectedFile(null);
                        setClientName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                >
                    Limpiar
                </button>
            </div>
        </form>
    );
};

export default DocumentUpload;
