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