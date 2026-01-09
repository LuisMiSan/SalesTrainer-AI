export interface Scenario {
    id: number;
    personaName: string;
    role: string;
    companyType: string;
    difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
    status: 'Bloqueado' | 'Disponible' | 'Completado' | 'Dominado';
    avatarColor: string;
    description: string;
}

export interface Objection {
    id: number;
    title: string;
    category: 'Precio' | 'Tiempo' | 'Competencia' | 'Necesidad' | 'Autoridad';
    response: string;
    icon: string;
}

export interface TrainingSession {
    id: number;
    score: number;
    date: string;
    scenarioId: number;
}

export interface Lead {
    id: number;
    name: string;
    company: string;
    position: string;
    email: string;
    phone: string;
    status: 'Nuevo' | 'Contactado' | 'Reunión' | 'Propuesta' | 'Ganado' | 'Perdido';
    priority: 'Alta' | 'Media' | 'Baja';
    value: number;
    nextFollowUp?: string;
}

export interface Clip {
    id: string;
    title: string;
    type: 'strength' | 'improvement' | 'objection' | 'closing' | 'general';
    startTime?: number;
    endTime?: number;
}

export interface MeetingAnalysis {
    confidence: number;
    clarity: number;
    empathy: number;
    pace?: number;
    score?: number;
}

export interface Meeting {
    id: number;
    title: string;
    leadId: number;
    leadName: string;
    date: string;
    time: string;
    type: 'Llamada' | 'Videollamada' | 'Presencial';
    status: 'Programada' | 'Completada' | 'Cancelada';
    reminderMinutes?: number;
    analysis?: MeetingAnalysis;
    clips?: Clip[];
}

export interface Pitch {
    id: number;
    title: string;
    content: string;
    url?: string;
    isFavorite: boolean;
    date: string;
}