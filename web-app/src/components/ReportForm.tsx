'use client';

import { useState } from 'react';
import styles from './ReportForm.module.css';

const ReportForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        clientName: '',
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Report Data:', formData);
        alert('Informe guardado (simulación)');
    };

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>Título del Informe</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    className={styles.input}
                    placeholder="Ej: Visita domiciliaria #123"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="clientName" className={styles.label}>Nombre del Cliente/Beneficiario</label>
                <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    className={styles.input}
                    placeholder="Nombre completo"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.label}>Notas y Observaciones</label>
                <textarea
                    id="notes"
                    name="notes"
                    className={styles.textarea}
                    placeholder="Escribe aquí los detalles del caso..."
                    value={formData.notes}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton}>
                    Guardar Informe
                </button>
                <button type="button" className={styles.cancelButton} onClick={() => window.history.back()}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default ReportForm;
