import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Icon } from './components/Icon';
import { WeeklyBarChart, SkillsRadarChart, EvolutionLineChart } from './components/Charts';
import { Scenario, Objection, Lead, Meeting, Pitch } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- MOCK DATA ---
const MOCK_SCENARIOS: Scenario[] = [
    { id: 1, personaName: 'Marta (Gatekeeper)', role: 'Recepcionista', companyType: 'Consultora', difficulty: 'Principiante', status: 'Disponible', avatarColor: 'bg-green-100 text-green-600', description: 'Marta protege el acceso al CEO. Tu objetivo es conseguir agendar una llamada con su jefe.' },
    { id: 2, personaName: 'Carlos (Escéptico)', role: 'Director Técnico', companyType: 'SaaS', difficulty: 'Intermedio', status: 'Disponible', avatarColor: 'bg-orange-100 text-orange-600', description: 'Carlos ha tenido malas experiencias con herramientas similares. Debes ganar su confianza técnica.' },
    { id: 3, personaName: 'Elena (Directora)', role: 'Directora de Marketing', companyType: 'Retail', difficulty: 'Avanzado', status: 'Bloqueado', avatarColor: 'bg-purple-100 text-purple-600', description: 'Elena tiene poco tiempo y necesita resultados rápidos. Tienes 2 minutos para convencerla.' },
];

const MOCK_OBJECTIONS: Objection[] = [
    { id: 1, title: 'Es demasiado caro', category: 'Precio', icon: 'payments', response: 'Entiendo que el presupuesto es clave. Sin embargo, nuestros clientes suelen ver un ROI de 3x en los primeros 6 meses.' },
    { id: 2, title: 'No tengo tiempo', category: 'Tiempo', icon: 'schedule', response: 'Comprendo perfectamente. Solo necesito 10 minutos para mostrarle cómo nuestra herramienta le ahorrará 5 horas semanales.' },
    { id: 3, title: 'Ya uso otra solución', category: 'Competencia', icon: 'compare_arrows', response: 'Es genial que ya estén abordando este problema. ¿Qué es lo que más le gusta de su solución actual?' },
    { id: 4, title: 'Necesito consultarlo', category: 'Autoridad', icon: 'group', response: 'Totalmente comprensible. ¿Qué información específica necesitaría su socio para tomar una decisión?' },
    { id: 5, title: 'Envíame un correo', category: 'Tiempo', icon: 'mail', response: 'Por supuesto. Para asegurarme de enviarle solo lo relevante, ¿cuál es el principal desafío que enfrentan hoy?' },
];

const MOCK_LEADS: Lead[] = [
    { id: 1, name: 'Ana López', company: 'TechSolutions', position: 'CTO', email: 'ana@tech.com', phone: '+34 600 111 222', status: 'Propuesta', priority: 'Alta', value: 5000, nextFollowUp: 'hace 2 días', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2Psi5L9ESHkKxPYkkamEq-sfERxxLr0WlTCeYaTjF1i-KuCKd6qQrxb2rikjKgGFcz21ug7V-treXtxJ23SaStXbUZC8BsitPvZPUSYlYzG8o11_1ueGkvoXBjQY9hrIHdHm6S3yn3oa3a2nZHF26KPruFUOsO0TUWtljXpWpL_8H1deDRrv128eG5m7KNPpMZ8ZHhhQ1AWhh8CjjtQp4Kwa2VqtywdAvKO6R3Sc07ELl44mVC1ulBN4vqPR8V7UJIh3xGYaTXfnQ' },
    { id: 2, name: 'Carlos García', company: 'Innovate SL', position: 'CEO', email: 'pedro@innovate.com', phone: '+34 600 333 444', status: 'Contactado', priority: 'Media', value: 2500, nextFollowUp: 'hace 5 días', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkIpuXxmspGf6l9NEp_5sNahnirYY9oi9XM611p7C5WdcxNHLw8v-gLsrdX0K06qF_pn0W592VQyNIoIeFP9ywINKkdFVM0WissTAqXptzVcvg0xS-5_AdUIP6npT7d2GgFVAFrqCldbJc3o_jbyhKlveS6q9jsuOqgL-jM57ny3yKzsk4YGOcmcRXVWuBR9WJDkElN5VXl-a0DBzvBQe6LPIZv4TN7o1FASkyZ06WVWstpn3wWk5hZBqP-j_SNoopWbwl9gflv_t' },
    { id: 3, name: 'Elena Rodríguez', company: 'Marketing Pro', position: 'Marketing Dir', email: 'lucia@mkt.com', phone: '+34 600 555 666', status: 'Negociación', priority: 'Alta', value: 8000, nextFollowUp: 'hace 1 semana', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOAOKtGEtvT54wOmN4DNhdG3_Ev_H_q9NoyiemMZrsFeFUSFK2mWyRxUEPI5n6-q58KlkP2Sxhdpky7ZfEkI6zAROlcpL7DgLr6AYBVRp3lX5TQCPs4iavHseVgob2kZMMHpPXZiY-Gvz3t7D149b5J_sKUZRT2p9ZkI1OZZm6rmQX4Jg0tEkVCFpqA9WE4xvAeG4sub92zIZcftv6L4ihFODeeo3jZvEqmKo2_chXkeK_hSPI1DdSVi4Ij_3iCJU6OwfhVxHuYoI_' },
    { id: 4, name: 'Javier Ruiz', company: 'Logistics Co', position: 'Gerente', email: 'javier@log.com', phone: '+34 600 777 888', status: 'Reunión', priority: 'Baja', value: 1500 },
    { id: 5, name: 'Sofia M.', company: 'Fintech X', position: 'CFO', email: 'sofia@fin.com', phone: '+34 600 999 000', status: 'Ganado', priority: 'Alta', value: 12000, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
];

const MOCK_MEETINGS: Meeting[] = [
    { id: 1, title: 'Demo de Producto', leadId: 1, leadName: 'Ana Garcia', date: '2023-10-27', time: '10:00', type: 'Videollamada', status: 'Programada', reminderMinutes: 15 },
    { id: 2, title: 'Reunión Inicial', leadId: 2, leadName: 'Pedro Martinez', date: '2023-10-28', time: '16:30', type: 'Llamada', status: 'Programada', reminderMinutes: 60 },
    { id: 3, title: 'Revisión Contrato', leadId: 3, leadName: 'Lucia Lopez', date: '2023-10-30', time: '11:00', type: 'Presencial', status: 'Programada', reminderMinutes: 30 },
];

const MOCK_PENDING_PITCHES: Pitch[] = [
    { id: 1, title: 'Pitch para Empresa A', content: '', date: '2023-10-25', status: 'pending_review', isFavorite: false },
    { id: 2, title: 'Pitch para Empresa B', content: '', date: '2023-10-24', status: 'reviewed', isFavorite: false },
    { id: 3, title: 'Pitch para Startup X', content: '', date: '2023-10-23', status: 'pending_review', isFavorite: true },
];

const HISTORY_DATA = [
    {
        id: 1,
        title: "Reunión con Inversiones Globales",
        date: "15 de mayo de 2024",
        status: "closed",
        scores: { confidence: 85, clarity: 92, empathy: 78 },
        hasChart: true,
        clips: [
            { id: 'c1', title: 'Clip 1', type: 'strength', duration: '0:45' },
            { id: 'c2', title: 'Clip 2', type: 'objection', duration: '1:20' }
        ],
        notes: "Cliente interesado en la integración API. Presupuesto aprobado para Q3.",
        nextActions: "Enviar documentación técnica y propuesta económica revisada.",
        leadStatusAfter: "propuesta"
    },
    {
        id: 2,
        title: "Presentación a Soluciones SaaS",
        date: "10 de mayo de 2024",
        status: "closed",
        scores: { confidence: 80, clarity: 88, empathy: 75 },
        hasChart: false,
        clips: [],
        notes: "Reunión positiva. Tienen dudas sobre la seguridad.",
        nextActions: "Agendar reunión con el CISO.",
        leadStatusAfter: "reunión"
    },
    {
        id: 3,
        title: "Seguimiento con Tecnologías Apex",
        date: "5 de mayo de 2024",
        status: "pending",
        scores: { confidence: 75, clarity: 85, empathy: 70 },
        hasChart: false,
        clips: [
            { id: 'c3', title: 'Clip 1', type: 'closing', duration: '0:30' }
        ]
    }
];

const CHART_DATA = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    confidence: [50, 55, 50, 85, 90, 80, 85],
    clarity: [50, 55, 65, 75, 50, 55, 70],
    empathy: [50, 50, 50, 50, 55, 60, 70]
};

// --- COMPONENTS ---

const ClipPlayerModal = ({ clip, onClose }: { clip: any, onClose: () => void }) => {
    if (!clip) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100">
                <div className="bg-secondary text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold">{clip.title}</h3>
                    <button onClick={onClose}><Icon name="close" className="text-white/80 hover:text-white" /></button>
                </div>
                <div className="p-8 flex flex-col items-center justify-center bg-gray-900 aspect-video">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 cursor-pointer hover:scale-110 transition-transform">
                        <Icon name="play_arrow" size={32} className="text-white" />
                    </div>
                    <div className="w-full bg-gray-700 h-1 rounded-full mt-4 overflow-hidden">
                        <div className="bg-primary w-1/3 h-full"></div>
                    </div>
                    <div className="flex justify-between w-full text-xs text-gray-400 mt-2">
                        <span>0:15</span>
                        <span>{clip.duration || '1:00'}</span>
                    </div>
                </div>
                <div className="p-4 bg-surface">
                    <p className="text-sm text-subtle">Este clip muestra un momento clave de la conversación analizado por la IA.</p>
                </div>
            </div>
        </div>
    );
};

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
        onClick={onChange}
        className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
        <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform transform duration-200 ease-in-out ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ left: 0, transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}></div>
    </button>
);

const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="mb-4">
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-text">{label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
                className={`h-4 rounded-full ${color}`} 
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

// --- HELPER FOR LEAD STATUS ---
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Propuesta': return 'text-yellow-500 bg-yellow-500';
        case 'Contactado': return 'text-green-500 bg-green-500';
        case 'Negociación': return 'text-blue-500 bg-blue-500';
        case 'Ganado': return 'text-green-600 bg-green-600';
        case 'Perdido': return 'text-red-500 bg-red-500';
        default: return 'text-gray-400 bg-gray-400';
    }
};

// --- PLACEHOLDER COMPONENTS ---
const Objections = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Objeciones</h1><p className="text-subtle">Lista de objeciones comunes.</p></div>;
const CreateObjectionPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Crear Objeción</h1><p className="text-subtle">Formulario para añadir nueva objeción.</p></div>;
const Scenarios = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Escenarios</h1><p className="text-subtle">Escenarios de práctica disponibles.</p></div>;
const LeadsPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Leads</h1><p className="text-subtle">Gestión de prospectos y clientes.</p></div>;
const MeetingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Reuniones</h1><p className="text-subtle">Calendario de reuniones.</p></div>;
const MeetingResultsPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Resultados de Reunión</h1><p className="text-subtle">Análisis y detalles de la reunión.</p></div>;
const WebAnalysis = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Análisis Web</h1><p className="text-subtle">Generación de pitch desde URL.</p></div>;
const ManualPitchPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Pitch Manual</h1><p className="text-subtle">Crear pitch manualmente.</p></div>;
const Practice = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Práctica</h1><p className="text-subtle">Sesión de entrenamiento.</p></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Ajustes</h1><p className="text-subtle">Configuración de usuario.</p></div>;
const SubscriptionSuccessPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4 text-green-600">¡Suscripción Exitosa!</h1><p className="text-subtle">Gracias por suscribirte.</p></div>;

const CallHistoryPage = ({ isUserView, userName }: { isUserView?: boolean, userName?: string }) => (
    <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Historial de Llamadas {userName ? `de ${userName}` : ''}</h1>
        <p className="text-subtle">Análisis y evolución de llamadas.</p>
    </div>
);

const WebHistoryPage = ({ isUserView, userName }: { isUserView?: boolean, userName?: string }) => (
    <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Historial de Pitches {userName ? `de ${userName}` : ''}</h1>
        <p className="text-subtle">Pitches generados y revisados.</p>
    </div>
);

const ProfilePage = ({ isUserView, userId }: { isUserView?: boolean, userId?: string }) => (
    <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Perfil {userId ? `(Usuario: ${userId})` : ''}</h1>
        <p className="text-subtle">Detalles del usuario y estadísticas.</p>
    </div>
);

// --- PAGES ---

const LoginPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-6">
            <div className="w-full max-w-md">
                <div className="mb-10 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                        <Icon name="school" className="text-primary" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-text mb-2">PerfectCall AI</h1>
                    <p className="text-subtle">Entrena tus habilidades de ventas.</p>
                </div>
                <div className="space-y-4 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <input type="email" placeholder="tu@email.com" className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                    <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                    <button onClick={() => navigate('/dashboard')} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-primary/90">
                        <span>Iniciar Sesión</span>
                    </button>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-blue-800">Demo: demo@perfectcall.com / demo123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Dynamic values with fallbacks
    const userName = user?.name || 'Usuario';
    const streak = user?.stats?.streak || 5;

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col justify-between overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="flex-grow">
                <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark">
                    <div className="w-12"></div>
                    <h1 className="flex-1 text-center text-lg font-bold text-foreground-light dark:text-foreground-dark">Dashboard</h1>
                    <div className="flex w-12 items-center justify-end">
                        <button 
                            onClick={() => navigate('/settings')}
                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-foreground-light dark:text-foreground-dark"
                        >
                            <span className="material-symbols-outlined text-2xl">settings</span>
                        </button>
                    </div>
                </header>
                <main className="px-4 pb-8">
                    <div className="mb-6 rounded-2xl bg-primary/10 dark:bg-primary/20 p-6 text-center">
                        <img 
                            alt="Ilustración amigable" 
                            className="mx-auto mb-4 h-24 w-24 rounded-full object-cover" 
                            src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCTH06CJ2bT5pJ3yiGSjgBwSdfzWODhxLIP7txr__98phd9JQiyqM2zSPB5WuOunRzE6B4P85BcfNK-h_rysXPgcGClE5fBefW5qseuIZbojQvu6ozRumwnH0ZsSau-xiZOfVpA23MGqpt5jNI8euHxOKITXVYi_0mA67gz4SP5GIzfPepzycvmqklmy1HbXN8SVxO4n5Dk-oqvUGQFsBKabofg5sAaNYYScPQaal8qcRL3-D9CQ-bv7qx-9QFwZlk-Yfv8TqKEUIc9"}
                        />
                        <h2 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">¡Hola de nuevo!</h2>
                        <p className="text-subtle-light dark:text-subtle-dark">
                            Tu racha de práctica es de <span className="font-bold text-primary">{streak} días</span>. ¡Sigue así!
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => navigate('/web-analysis')} className="block cursor-pointer rounded-2xl bg-background-light dark:bg-background-dark border border-primary/20 p-4 text-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-primary mx-auto">travel_explore</span>
                            <h3 className="mt-2 text-sm font-bold text-foreground-light dark:text-foreground-dark">Iniciar Análisis</h3>
                        </div>
                        <div onClick={() => navigate('/leads')} className="block cursor-pointer rounded-2xl bg-background-light dark:bg-background-dark border border-primary/20 p-4 text-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-primary mx-auto">groups</span>
                            <h3 className="mt-2 text-sm font-bold text-foreground-light dark:text-foreground-dark">Leads Activos</h3>
                        </div>
                        <div onClick={() => navigate('/web-history')} className="block cursor-pointer rounded-2xl bg-background-light dark:bg-background-dark border border-primary/20 p-4 text-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-primary mx-auto">pending_actions</span>
                            <h3 className="mt-2 text-sm font-bold text-foreground-light dark:text-foreground-dark">Pitches Pendientes</h3>
                        </div>
                        <div onClick={() => navigate('/practice')} className="block cursor-pointer rounded-2xl bg-background-light dark:bg-background-dark border border-primary/20 p-4 text-center hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-primary mx-auto">checklist</span>
                            <h3 className="mt-2 text-sm font-bold text-foreground-light dark:text-foreground-dark">Práctica Diaria</h3>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-background-light dark:bg-background-dark border border-primary/20 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground-light dark:text-foreground-dark">Progreso Semanal</h3>
                            <Link to="/analysis" className="text-sm font-medium text-primary">Detalles</Link>
                        </div>
                        <div className="h-48">
                             {/* Reusing existing WeeklyBarChart or similar logic, assuming updated chart styling happens inside component or global CSS */}
                            <WeeklyBarChart 
                                labels={['Confianza', 'Claridad', 'Empatía']}
                                data={[75, 88, 82]}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground-light dark:text-foreground-dark">Leads Recientes</h3>
                            <Link to="/leads" className="text-sm font-medium text-primary">Ver todos</Link>
                        </div>
                        <div className="space-y-4">
                             {MOCK_LEADS.slice(0, 2).map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/leads')}>
                                    <div className="flex items-center gap-3">
                                        <img 
                                            alt={lead.name} 
                                            className="h-10 w-10 rounded-full object-cover" 
                                            src={lead.avatar || `https://ui-avatars.com/api/?name=${lead.name}&background=random`} 
                                        />
                                        <div>
                                            <p className="font-medium text-foreground-light dark:text-foreground-dark">{lead.name}</p>
                                            <p className="text-sm text-subtle-light dark:text-subtle-dark">
                                                {lead.status === 'Propuesta' ? 'Propuesta enviada' : 'Primer contacto'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-xl text-subtle-light dark:text-subtle-dark">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// ... other components ...

const AdminPage = () => {
    const navigate = useNavigate();
    const [viewingUser, setViewingUser] = useState<{id: string, name: string, type: 'calls' | 'pitches' | 'profile'} | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'objections' | 'leads'>('dashboard');

    if (viewingUser) {
        return (
            <div className="p-4 md:p-8 pb-24 md:pb-8">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => setViewingUser(null)}
                        className="mr-3 text-subtle hover:text-primary"
                    >
                        <Icon name="arrow_back" />
                    </button>
                    <h1 className="text-2xl font-bold text-text">
                        {viewingUser.type === 'calls' ? 'Llamadas de' : viewingUser.type === 'pitches' ? 'Pitches de' : 'Perfil de'} {viewingUser.name}
                    </h1>
                </div>
                
                {viewingUser.type === 'calls' && <CallHistoryPage isUserView userName={viewingUser.name} />}
                {viewingUser.type === 'pitches' && <WebHistoryPage isUserView userName={viewingUser.name} />}
                {viewingUser.type === 'profile' && <ProfilePage isUserView userId={viewingUser.id} />}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                <h1 className="text-2xl font-bold text-text">Panel de Administración</h1>
            </header>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-subtle text-xs font-bold uppercase">Usuarios</p>
                    <p className="text-2xl font-bold text-text">1,245</p>
                </div>
                <div className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100">
                     <p className="text-subtle text-xs font-bold uppercase">Pitches</p>
                    <p className="text-2xl font-bold text-text">8,932</p>
                </div>
                <div className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100">
                     <p className="text-subtle text-xs font-bold uppercase">Prácticas</p>
                    <p className="text-2xl font-bold text-text">12.5k</p>
                </div>
                 <div className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100">
                     <p className="text-subtle text-xs font-bold uppercase">Ingresos</p>
                    <p className="text-2xl font-bold text-green-600">€45k</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-100 overflow-x-auto">
                {(['dashboard', 'users', 'objections', 'leads'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-4 font-bold text-sm capitalize whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'text-primary border-primary' : 'text-subtle border-transparent hover:text-text'}`}
                    >
                        {
                            tab === 'dashboard' ? 'General' : 
                            tab === 'users' ? 'Usuarios' : 
                            tab === 'objections' ? 'Objeciones' : 
                            'Leads'
                        }
                    </button>
                ))}
            </div>

            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Global Skill Evolution Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-[#2C3E50]">Evolución Global de Habilidades</h3>
                        </div>
                        <div className="h-72">
                            <EvolutionLineChart 
                                labels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']} 
                                confidenceData={[65, 68, 72, 75]}
                                clarityData={[60, 65, 70, 74]}
                                empathyData={[70, 72, 74, 78]}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                 <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                    U{i}
                                </div>
                                <div>
                                    <p className="font-bold text-text">Usuario Demo {i}</p>
                                    <p className="text-xs text-subtle">user{i}@demo.com</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                {/* Added Streak Info for Admin */}
                                <div className="text-center min-w-[3rem] hidden md:block">
                                     <span className="block font-bold text-lg text-[#3498DB]">
                                        {Math.floor(Math.random() * 15)}🔥
                                     </span>
                                     <span className="text-[10px] text-subtle uppercase font-bold">Racha</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setViewingUser({id: `${i}`, name: `Usuario Demo ${i}`, type: 'profile'})} className="p-2 text-subtle hover:text-primary"><Icon name="person" size={20} /></button>
                                    <button onClick={() => setViewingUser({id: `${i}`, name: `Usuario Demo ${i}`, type: 'calls'})} className="p-2 text-subtle hover:text-primary"><Icon name="history" size={20} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             
            {activeTab !== 'users' && activeTab !== 'dashboard' && (
                <div className="text-center py-12 text-subtle">
                    <Icon name="construction" size={48} className="mb-4 opacity-50 mx-auto" />
                    <p>Sección en construcción</p>
                </div>
            )}
        </div>
    );
};

const App = () => {
  return (
    <AuthProvider>
        <HashRouter>
          <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Feature Routes */}
                        <Route path="/objections" element={<Objections />} />
                        <Route path="/objections/create" element={<CreateObjectionPage />} />
                        <Route path="/scenarios" element={<Scenarios />} />
                        <Route path="/leads" element={<LeadsPage />} />
                        <Route path="/meetings" element={<MeetingsPage />} />
                        <Route path="/meetings/:id/results" element={<MeetingResultsPage />} />
                        
                        {/* Pitch & Analysis */}
                        <Route path="/web-analysis" element={<WebAnalysis />} />
                        <Route path="/pitch/manual" element={<ManualPitchPage />} />
                        <Route path="/web-history" element={<WebHistoryPage />} />
                        
                        {/* Practice */}
                        <Route path="/practice" element={<Practice />} />
                        <Route path="/analysis" element={<CallHistoryPage />} />
                        
                        {/* User & Settings */}
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/success" element={<SubscriptionSuccessPage />} />
                        
                        {/* Admin */}
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </main>
                <BottomNav />
            </div>
          </div>
        </HashRouter>
    </AuthProvider>
  );
};

export default App;