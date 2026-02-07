export interface Report {
    id: string;
    title: string;
    clientName: string;
    date: string;
    status: 'Completo' | 'En Progreso' | 'Pendiente';
}

export const recentReports: Report[] = [
    {
        id: '1',
        title: 'Evaluación inicial de caso #452',
        clientName: 'María García',
        date: '2023-10-25',
        status: 'Completo',
    },
    {
        id: '2',
        title: 'Seguimiento mensual',
        clientName: 'Juan Pérez',
        date: '2023-10-24',
        status: 'En Progreso',
    },
    {
        id: '3',
        title: 'Visita domiciliaria',
        clientName: 'Familia López',
        date: '2023-10-22',
        status: 'Pendiente',
    },
    {
        id: '4',
        title: 'Entrevista con tutores',
        clientName: 'Pedro Rodriguez',
        date: '2023-10-20',
        status: 'Completo',
    },
];
