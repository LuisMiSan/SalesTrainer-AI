import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Icon } from './components/Icon';
import { WeeklyBarChart, SkillsRadarChart, EvolutionLineChart } from './components/Charts';
import { Scenario, Objection, Lead, Meeting, Pitch } from './types';

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
    { id: 1, name: 'Ana Garcia', company: 'TechSolutions', position: 'CTO', email: 'ana@tech.com', phone: '+34 600 111 222', status: 'Nuevo', priority: 'Alta', value: 5000, nextFollowUp: '2023-10-25' },
    { id: 2, name: 'Pedro Martinez', company: 'Innovate SL', position: 'CEO', email: 'pedro@innovate.com', phone: '+34 600 333 444', status: 'Contactado', priority: 'Media', value: 2500, nextFollowUp: '2023-10-26' },
    { id: 3, name: 'Lucia Lopez', company: 'Marketing Pro', position: 'Marketing Dir', email: 'lucia@mkt.com', phone: '+34 600 555 666', status: 'Propuesta', priority: 'Alta', value: 8000 },
    { id: 4, name: 'Javier Ruiz', company: 'Logistics Co', position: 'Gerente', email: 'javier@log.com', phone: '+34 600 777 888', status: 'Reunión', priority: 'Baja', value: 1500 },
    { id: 5, name: 'Sofia M.', company: 'Fintech X', position: 'CFO', email: 'sofia@fin.com', phone: '+34 600 999 000', status: 'Ganado', priority: 'Alta', value: 12000 },
];

const MOCK_MEETINGS: Meeting[] = [
    { id: 1, title: 'Demo de Producto', leadId: 1, leadName: 'Ana Garcia', date: '2023-10-27', time: '10:00', type: 'Videollamada', status: 'Programada', reminderMinutes: 15 },
    { id: 2, title: 'Reunión Inicial', leadId: 2, leadName: 'Pedro Martinez', date: '2023-10-28', time: '16:30', type: 'Llamada', status: 'Programada', reminderMinutes: 60 },
    { id: 3, title: 'Revisión Contrato', leadId: 3, leadName: 'Lucia Lopez', date: '2023-10-30', time: '11:00', type: 'Presencial', status: 'Programada', reminderMinutes: 30 },
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
        // Added result fields
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

// Updated Mock data for Web Analysis History to match screenshot icons and colors
const PITCH_HISTORY_DATA = [
    { id: 1, url: "www.example.com", date: "15 de Enero, 2024", icon: "check_box", color: "bg-emerald-500 text-white" },
    { id: 2, url: "www.another-example.com", date: "10 de Enero, 2024", icon: "diamond", color: "bg-gray-100 text-teal-600" },
    { id: 3, url: "www.sales-pitch.com", date: "05 de Enero, 2024", icon: "mail", color: "bg-teal-700 text-white" },
    { id: 4, url: "www.ai-powered-sales.com", date: "20 de Diciembre, 2023", icon: "verified", color: "bg-emerald-300 text-emerald-800" },
    { id: 5, url: "www.lead-generation.com", date: "15 de Diciembre, 2023", icon: "expand_more", color: "bg-gray-100 text-gray-600" },
];

const CHART_DATA = {
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    confidence: [25, 40, 70, 55, 65, 85, 95],
    clarity: [35, 30, 60, 45, 75, 78, 88],
    empathy: [30, 50, 55, 40, 68, 72, 82]
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
                    {/* Fake Player UI */}
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

// Toggle Component
const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
        onClick={onChange}
        className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
        <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform transform duration-200 ease-in-out ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} style={{ left: 0, transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}></div>
    </button>
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
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto">
            <header className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text">Hola, Usuario 👋</h1>
                    <p className="text-sm text-subtle">Resumen de actividad</p>
                </div>
                <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-primary md:hidden"><Icon name="settings" /></button>
            </header>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div onClick={() => navigate('/leads')} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg"><Icon name="group" className="text-blue-500" size={20}/></div>
                        <span className="text-xs text-subtle">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-text">{MOCK_LEADS.length}</p>
                    <p className="text-xs text-subtle">Leads Activos</p>
                </div>
                <div onClick={() => navigate('/meetings')} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg"><Icon name="event" className="text-purple-500" size={20}/></div>
                        <span className="text-xs text-subtle">Próximas</span>
                    </div>
                    <p className="text-2xl font-bold text-text">{MOCK_MEETINGS.length}</p>
                    <p className="text-xs text-subtle">Reuniones</p>
                </div>
                <div onClick={() => navigate('/web-analysis')} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg"><Icon name="description" className="text-orange-500" size={20}/></div>
                        <span className="text-xs text-subtle">Pitches</span>
                    </div>
                    <p className="text-2xl font-bold text-text">12</p>
                    <p className="text-xs text-subtle">Generados</p>
                </div>
                <div onClick={() => navigate('/analysis')} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-green-100 rounded-lg"><Icon name="trending_up" className="text-green-500" size={20}/></div>
                        <span className="text-xs text-subtle">Evolución</span>
                    </div>
                    <p className="text-2xl font-bold text-text">8.5</p>
                    <p className="text-xs text-subtle">Promedio</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text">Próximas Reuniones</h3>
                        <Link to="/meetings" className="text-xs text-primary font-bold hover:underline">Ver todas</Link>
                    </div>
                    <div className="space-y-3">
                        {MOCK_MEETINGS.slice(0, 3).map(meeting => (
                            <div key={meeting.id} className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                                    <Icon name="event" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-text truncate">{meeting.title}</p>
                                    <p className="text-xs text-subtle truncate">{meeting.date} • {meeting.time} • {meeting.leadName}</p>
                                </div>
                                <span className="hidden sm:block text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{meeting.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button onClick={() => navigate('/web-analysis')} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-background transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Icon name="add_circle" size={28} /></div>
                            <span className="text-xs text-text font-bold">Crear Pitch</span>
                        </button>
                        <button onClick={() => navigate('/leads')} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-background transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Icon name="person_add" size={28} /></div>
                            <span className="text-xs text-text font-bold">Nuevo Lead</span>
                        </button>
                        <button onClick={() => navigate('/practice')} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-background transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Icon name="mic" size={28} /></div>
                            <span className="text-xs text-text font-bold">Practicar</span>
                        </button>
                        <button onClick={() => navigate('/objections')} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-background transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><Icon name="list" size={28} /></div>
                            <span className="text-xs text-text font-bold">Objeciones</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-4">Progreso Semanal</h3>
                    <div className="h-64">
                         <WeeklyBarChart 
                            labels={['L', 'M', 'X', 'J', 'V', 'S', 'D']} 
                            data={[2, 4, 1, 5, 3, 0, 0]} 
                        />
                    </div>
                </div>
                 <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-4">Habilidades</h3>
                    <div className="h-64 w-full">
                        <SkillsRadarChart scores={[60, 85, 45, 70, 75]} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CallHistoryPage = ({ isUserView = false, userName = '' }) => {
    const [selectedClip, setSelectedClip] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'closed' | 'pending'>('all');

    // Filter logic
    const filteredHistory = HISTORY_DATA.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
         <div className="flex flex-col h-full bg-background relative">
            <header className="bg-surface p-4 border-b border-gray-100 sticky top-0 z-10">
                <div className="flex items-center mb-4">
                    <button onClick={() => window.history.back()} className="mr-3 text-subtle hover:text-primary"><Icon name="arrow_back" /></button>
                    <h1 className="text-xl font-bold flex-1 text-center md:text-left">
                        {isUserView ? `Historial de ${userName}` : 'Historial de Llamadas'}
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Icon name="search" className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Buscar por nombre o empresa"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-background rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button 
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-subtle hover:bg-gray-200'
                        }`}
                    >
                        Todas
                    </button>
                    <button 
                        onClick={() => setActiveFilter('closed')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeFilter === 'closed' ? 'bg-primary text-white' : 'bg-gray-100 text-subtle hover:bg-gray-200'
                        }`}
                    >
                        Cerradas
                    </button>
                    <button 
                        onClick={() => setActiveFilter('pending')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeFilter === 'pending' ? 'bg-primary text-white' : 'bg-gray-100 text-subtle hover:bg-gray-200'
                        }`}
                    >
                        Pendientes
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-8">
                <div className="max-w-2xl mx-auto w-full space-y-4">
                    {filteredHistory.map(item => (
                        <div key={item.id} className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4 cursor-pointer">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1 shrink-0">
                                        <Icon name="call" size={20} filled={false} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text text-base leading-tight mb-1">{item.title}</h3>
                                        <p className="text-sm text-subtle">{item.date}</p>
                                    </div>
                                </div>
                                <Icon name="chevron_right" className="text-gray-300 mt-2" size={20} />
                            </div>

                            {/* Results Summary (New addition for admin/history) */}
                            {item.notes && (
                                <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon name="assignment" size={16} className="text-primary" />
                                        <span className="text-xs font-bold text-primary uppercase">Resultados</span>
                                    </div>
                                    <p className="text-sm text-text mb-2 line-clamp-2">{item.notes}</p>
                                    <div className="flex flex-wrap gap-2">
                                         {item.leadStatusAfter && (
                                            <span className="px-2 py-0.5 bg-white rounded border border-blue-100 text-xs text-primary font-medium">
                                                Estado: {item.leadStatusAfter}
                                            </span>
                                         )}
                                    </div>
                                </div>
                            )}

                            {/* Scores (Text based) */}
                            <div className="flex justify-between mb-4 px-2">
                                <div className="text-center">
                                    <p className="text-xs text-subtle mb-1">Confianza</p>
                                    <p className="text-lg font-bold text-text">{item.scores.confidence}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-subtle mb-1">Claridad</p>
                                    <p className="text-lg font-bold text-text">{item.scores.clarity}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-subtle mb-1">Empatía</p>
                                    <p className="text-lg font-bold text-text">{item.scores.empathy}%</p>
                                </div>
                            </div>

                            {/* Embedded Chart (Only if item hasChart) */}
                            {item.hasChart && (
                                <div className="mb-4 bg-background/50 rounded-xl p-3">
                                    <p className="text-sm font-bold text-text mb-2">Tendencia de Scores</p>
                                    <div className="h-24 w-full">
                                        <EvolutionLineChart 
                                            labels={CHART_DATA.labels}
                                            confidenceData={CHART_DATA.confidence}
                                            clarityData={CHART_DATA.clarity}
                                            empathyData={CHART_DATA.empathy}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Clips */}
                            {item.clips.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-text mb-2">Clips Destacados</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {item.clips.map(clip => (
                                            <button 
                                                key={clip.id} 
                                                onClick={() => setSelectedClip(clip)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                                            >
                                                <Icon name="play_circle" size={16} className="text-text" />
                                                <span className="text-sm font-medium text-text">{clip.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Play Modal */}
            <ClipPlayerModal clip={selectedClip} onClose={() => setSelectedClip(null)} />
        </div>
    );
}

const WebHistoryPage = ({ isUserView = false, userName = '' }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = PITCH_HISTORY_DATA.filter(item => 
        item.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background font-sans">
             {/* Header */}
            <div className="bg-surface px-6 pt-6 pb-2 sticky top-0 z-10 shadow-sm md:shadow-none">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        {isUserView ? (
                            <button onClick={() => window.history.back()} className="text-text hover:bg-gray-100 rounded-full p-1"><Icon name="arrow_back" size={28}/></button>
                        ) : (
                            <button className="text-text hover:bg-gray-100 rounded-full p-1 md:hidden"><Icon name="menu" size={28} /></button>
                        )}
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-text leading-none">Historial de URLs</h1>
                            <h2 className="text-xl font-bold text-text leading-tight">Analizadas</h2>
                        </div>
                    </div>
                    {!isUserView && (
                        <div className="flex items-center gap-3">
                            <button className="relative p-1 text-text hover:bg-gray-100 rounded-full">
                                <Icon name="notifications" size={24} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                             <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                        </div>
                    )}
                </div>

                <div className="space-y-3 pb-2">
                    <div className="relative">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar URL..." 
                            className="w-full h-12 pl-11 pr-4 rounded-full border border-gray-200 bg-white shadow-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="w-full h-12 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center gap-2 text-sm font-bold text-text hover:bg-gray-50 transition-colors">
                        Filtros <Icon name="tune" size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:pb-8 space-y-3">
                {filteredHistory.map(item => (
                     <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.01] cursor-pointer">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                            <Icon name={item.icon} size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-text text-sm md:text-base truncate">{item.url}</h3>
                            <p className="text-xs text-subtle">{item.date}</p>
                        </div>
                        <div className="text-emerald-500 shrink-0">
                             <Icon name="check_circle" size={26} filled={false} className="text-emerald-500" />
                        </div>
                     </div>
                ))}
            </div>
        </div>
    );
};

// --- NEW PROFILE PAGE ---
const ProfilePage = ({ isUserView = false, userId = null }: { isUserView?: boolean, userId?: string | null }) => {
    // Mock user state matching the screenshot
    const [user, setUser] = useState({
        name: 'Sophia Bennett',
        username: 'sophiab',
        email: 'sophia.bennett@email.com',
        joinDate: '2022',
        avatar: 'https://i.pravatar.cc/300?u=sophiabennett',
        preferences: {
            notifications: {
                practiceReminders: false,
                practiceFrequency: 'daily', // 'daily' | 'weekly'
                aiFeedback: false,
                achievements: false,
                weeklySummary: false
            }
        }
    });

    const toggleNotification = (key: string) => {
        setUser(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                notifications: {
                    ...prev.preferences.notifications,
                    [key]: !prev.preferences.notifications[key as keyof typeof prev.preferences.notifications]
                }
            }
        }));
    };

    const setFrequency = (freq: string) => {
        setUser(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                notifications: {
                    ...prev.preferences.notifications,
                    practiceFrequency: freq
                }
            }
        }));
    };

    return (
        <div className="flex flex-col h-full bg-background font-sans">
             <header className="bg-surface px-4 py-4 border-b border-gray-100 sticky top-0 z-10 flex items-center">
                <button onClick={() => window.history.back()} className="mr-4 text-text hover:bg-gray-100 rounded-full p-2">
                    <Icon name="arrow_back" size={24} />
                </button>
                <h1 className="text-lg font-bold flex-1 text-center pr-12">Configuración del Perfil</h1>
            </header>

            <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
                <div className="max-w-md mx-auto w-full px-6 pt-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-28 h-28 rounded-full object-cover border-4 border-[#F2C94C]/20 shadow-sm"
                            />
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:bg-primary/90 transition-colors">
                                <Icon name="edit" size={16} />
                            </button>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-text">{user.name}</h2>
                        <p className="text-subtle text-base">@{user.username}</p>
                        <p className="text-subtle text-sm mt-1">Se unió en {user.joinDate}</p>
                    </div>

                    {/* Information Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-text mb-4">Información</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-base text-text mb-0.5">Correo electrónico</p>
                                    <p className="text-sm text-subtle truncate">{user.email}</p>
                                </div>
                                <Icon name="chevron_right" className="text-gray-400" />
                            </div>
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-base text-text mb-0.5">Nombre de usuario</p>
                                    <p className="text-sm text-subtle truncate">{user.name}</p>
                                </div>
                                <Icon name="chevron_right" className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-text mb-4">Notificaciones</h3>
                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-1">
                            {/* Practice Reminders */}
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-base text-text">Recordatorios de Práctica</span>
                                <Toggle 
                                    checked={user.preferences.notifications.practiceReminders} 
                                    onChange={() => toggleNotification('practiceReminders')} 
                                />
                            </div>

                            {/* Frequency Selector */}
                            <div className="px-4 pb-4">
                                <p className="text-sm text-subtle mb-3">Frecuencia</p>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button 
                                        onClick={() => setFrequency('daily')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                                            user.preferences.notifications.practiceFrequency === 'daily' 
                                            ? 'bg-primary/20 text-primary shadow-sm' 
                                            : 'text-subtle hover:text-text'
                                        }`}
                                    >
                                        Diario
                                    </button>
                                    <button 
                                        onClick={() => setFrequency('weekly')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                                            user.preferences.notifications.practiceFrequency === 'weekly' 
                                            ? 'bg-primary/20 text-primary shadow-sm' 
                                            : 'text-subtle hover:text-text'
                                        }`}
                                    >
                                        Semanal
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-gray-100"></div>

                            {/* AI Feedback */}
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-base text-text">Feedback de IA Disponible</span>
                                <Toggle 
                                    checked={user.preferences.notifications.aiFeedback} 
                                    onChange={() => toggleNotification('aiFeedback')} 
                                />
                            </div>

                            <div className="border-t border-gray-100"></div>

                            {/* Achievements */}
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-base text-text">Logros Desbloqueados</span>
                                <Toggle 
                                    checked={user.preferences.notifications.achievements} 
                                    onChange={() => toggleNotification('achievements')} 
                                />
                            </div>

                            <div className="border-t border-gray-100"></div>

                            {/* Weekly Summary */}
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-base text-text">Resumen Semanal</span>
                                <Toggle 
                                    checked={user.preferences.notifications.weeklySummary} 
                                    onChange={() => toggleNotification('weeklySummary')} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW SUBSCRIPTION SUCCESS PAGE ---
const SubscriptionSuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-background font-sans items-center justify-center p-6 min-h-screen">
            <div className="w-full max-w-md bg-transparent flex flex-col items-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                            <Icon name="check" size={48} className="text-white font-bold" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-text mb-4 leading-tight">
                    ¡Felicidades! Ya eres <br/> Premium.
                </h1>

                {/* Description */}
                <p className="text-center text-subtle mb-10 px-4 leading-relaxed">
                    Tu suscripción ha sido activada con éxito y ahora tienes acceso a todas las funciones exclusivas.
                </p>

                {/* Plan Details Card */}
                <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-subtle text-sm">Plan</span>
                        <span className="text-text font-bold text-sm">Premium</span>
                    </div>
                    <div className="flex justify-between items-center py-2 pt-4">
                        <span className="text-subtle text-sm">Próxima renovación</span>
                        <span className="text-text font-bold text-sm">15 de Julio, 2024</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-3">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center"
                    >
                        Ir al Dashboard
                    </button>
                    <button 
                        onClick={() => navigate('/settings')}
                        className="w-full h-12 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-colors flex items-center justify-center"
                    >
                        Gestionar Suscripción
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminPage = () => {
    // Updated ViewingUser type to include 'profile'
    const [viewingUser, setViewingUser] = useState<{id: string, name: string, type: 'calls' | 'pitches' | 'profile'} | null>(null);

    if (viewingUser) {
        if (viewingUser.type === 'calls') {
            return <CallHistoryPage isUserView={true} userName={viewingUser.name} />;
        } else if (viewingUser.type === 'pitches') {
            return <WebHistoryPage isUserView={true} userName={viewingUser.name} />;
        } else if (viewingUser.type === 'profile') {
            return <ProfilePage isUserView={true} userId={viewingUser.id} />;
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
             <header className="bg-surface p-4 md:p-6 border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Panel de Administración</h1>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Admin</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-7xl mx-auto w-full space-y-6">
                    
                    {/* System Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-subtle text-sm font-medium mb-1">Total Usuarios</h3>
                            <p className="text-3xl font-bold text-text">1,248</p>
                            <span className="text-xs text-green-500 font-bold flex items-center mt-2"><Icon name="trending_up" size={16} /> +12% este mes</span>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-subtle text-sm font-medium mb-1">Sesiones de Práctica</h3>
                            <p className="text-3xl font-bold text-text">8,542</p>
                            <span className="text-xs text-green-500 font-bold flex items-center mt-2"><Icon name="trending_up" size={16} /> +5% este mes</span>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-subtle text-sm font-medium mb-1">Pitches Generados</h3>
                            <p className="text-3xl font-bold text-text">3,102</p>
                            <span className="text-xs text-text font-bold flex items-center mt-2">-- estable</span>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Usuarios Recientes</h3>
                            <button className="text-primary text-sm font-bold hover:underline">Ver todos</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs text-subtle uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Usuario</th>
                                        <th className="px-6 py-4 font-bold">Rol</th>
                                        <th className="px-6 py-4 font-bold">Plan</th>
                                        <th className="px-6 py-4 font-bold">Estado</th>
                                        <th className="px-6 py-4 font-bold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    <tr className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">AM</div>
                                                <div>
                                                    <p className="font-bold text-text">Ana Martinez</p>
                                                    <p className="text-xs text-subtle">ana@empresa.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text">SDR</td>
                                        <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">PRO</span></td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1 text-green-600 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-green-500"></div> Activo</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button 
                                                    onClick={() => setViewingUser({id: '1', name: 'Ana Martinez', type: 'profile'})}
                                                    className="text-subtle font-bold text-xs hover:text-primary hover:underline"
                                                >
                                                    Perfil
                                                </button>
                                                <button 
                                                    onClick={() => setViewingUser({id: '1', name: 'Ana Martinez', type: 'calls'})}
                                                    className="text-primary font-bold text-xs hover:underline"
                                                >
                                                    Llamadas
                                                </button>
                                                <button 
                                                    onClick={() => setViewingUser({id: '1', name: 'Ana Martinez', type: 'pitches'})}
                                                    className="text-secondary font-bold text-xs hover:underline"
                                                >
                                                    Pitches
                                                </button>
                                                <button className="text-subtle hover:text-primary"><Icon name="more_vert" size={20} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">CR</div>
                                                <div>
                                                    <p className="font-bold text-text">Carlos Ruiz</p>
                                                    <p className="text-xs text-subtle">carlos@tech.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text">Manager</td>
                                        <td className="px-6 py-4"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">ENTERPRISE</span></td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1 text-green-600 font-bold text-xs"><div className="w-2 h-2 rounded-full bg-green-500"></div> Activo</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button 
                                                    onClick={() => setViewingUser({id: '2', name: 'Carlos Ruiz', type: 'profile'})}
                                                    className="text-subtle font-bold text-xs hover:text-primary hover:underline"
                                                >
                                                    Perfil
                                                </button>
                                                <button 
                                                    onClick={() => setViewingUser({id: '2', name: 'Carlos Ruiz', type: 'calls'})}
                                                    className="text-primary font-bold text-xs hover:underline"
                                                >
                                                    Llamadas
                                                </button>
                                                <button 
                                                    onClick={() => setViewingUser({id: '2', name: 'Carlos Ruiz', type: 'pitches'})}
                                                    className="text-secondary font-bold text-xs hover:underline"
                                                >
                                                    Pitches
                                                </button>
                                                <button className="text-subtle hover:text-primary"><Icon name="more_vert" size={20} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW PAGES ---

const Scenarios = () => {
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <header className="flex items-center mb-6">
                 <button onClick={() => window.history.back()} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                 <h1 className="text-2xl font-bold">Escenarios de Práctica</h1>
            </header>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_SCENARIOS.map(scenario => (
                    <div key={scenario.id} className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${scenario.avatarColor.split(' ')[0]} ${scenario.avatarColor.split(' ')[1]}`}>{scenario.difficulty}</span>
                            <span className={`text-xs font-bold ${scenario.status === 'Disponible' ? 'text-green-500' : 'text-gray-400'}`}>{scenario.status}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{scenario.personaName}</h3>
                        <p className="text-sm text-subtle mb-3 font-medium">{scenario.role} • {scenario.companyType}</p>
                        <p className="text-sm text-text mb-6 flex-1">{scenario.description}</p>
                        <button className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            Iniciar Simulación
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LeadsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col h-full">
            <header className="flex justify-between items-center mb-6">
                 <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                    <h1 className="text-2xl font-bold">Mis Leads</h1>
                 </div>
                <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                    <Icon name="add" size={20} className="text-white" /> <span className="hidden sm:inline">Nuevo Lead</span>
                </button>
            </header>
            <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-subtle uppercase border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">Nombre</th>
                                <th className="px-6 py-4 font-bold hidden sm:table-cell">Empresa</th>
                                <th className="px-6 py-4 font-bold">Estado</th>
                                <th className="px-6 py-4 font-bold hidden md:table-cell">Prioridad</th>
                                <th className="px-6 py-4 font-bold hidden lg:table-cell">Valor</th>
                                <th className="px-6 py-4 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {MOCK_LEADS.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-text">{lead.name}</p>
                                        <p className="text-xs text-subtle sm:hidden">{lead.company}</p>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell text-text">{lead.company}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            lead.status === 'Ganado' ? 'bg-green-100 text-green-700' :
                                            lead.status === 'Nuevo' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>{lead.status}</span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell text-text">{lead.priority}</td>
                                    <td className="px-6 py-4 hidden lg:table-cell text-text font-medium">${lead.value.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-subtle hover:text-primary"><Icon name="more_vert" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MeetingsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
             <header className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                    <h1 className="text-2xl font-bold">Agenda</h1>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                    <Icon name="add" size={20} className="text-white" /> <span className="hidden sm:inline">Agendar</span>
                </button>
            </header>
             <div className="space-y-4">
                {MOCK_MEETINGS.map(meeting => (
                    <div key={meeting.id} onClick={() => navigate(`/meetings/${meeting.id}/results`)} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                <Icon name="event" size={24} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-lg text-text truncate">{meeting.title}</h3>
                                <p className="text-sm text-subtle truncate">{meeting.date} • {meeting.time} • {meeting.leadName}</p>
                            </div>
                        </div>
                         <div className="flex flex-col items-end gap-2">
                             <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-subtle whitespace-nowrap">{meeting.status}</span>
                             <Icon name="chevron_right" className="text-gray-300" />
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MeetingResultsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // Mocking finding the meeting (in reality would fetch)
    const meeting = MOCK_MEETINGS.find(m => m.id === Number(id));

    if (!meeting) return <div>Reunión no encontrada</div>;

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary rounded-full p-1"><Icon name="arrow_back" size={24} /></button>
                <h1 className="text-2xl font-bold">Detalle de Reunión</h1>
            </header>
            
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h2 className="text-xl font-bold mb-2">{meeting.title}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-subtle mb-4">
                    <div className="flex items-center gap-1"><Icon name="person" size={18}/> {meeting.leadName}</div>
                    <div className="flex items-center gap-1"><Icon name="schedule" size={18}/> {meeting.date} - {meeting.time}</div>
                    <div className="flex items-center gap-1"><Icon name="videocam" size={18}/> {meeting.type}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-primary mb-2 text-sm uppercase">Notas de la IA</h3>
                    <p className="text-text text-sm leading-relaxed">
                        La reunión fue productiva. El cliente mostró interés en la funcionalidad de reportes avanzados.
                        Se detectaron momentos de duda al hablar del precio, se recomienda reforzar la propuesta de valor.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-4">Métricas de Comunicación</h3>
                    <div className="h-64 w-full">
                        <SkillsRadarChart scores={[75, 80, 60, 85, 70]} />
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="font-bold text-text mb-4">Clips Clave</h3>
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Icon name="check" size={20}/></div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">Cierre exitoso</p>
                                <p className="text-xs text-subtle">0:45 - 1:15</p>
                            </div>
                            <Icon name="play_circle" className="text-primary" size={24}/>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Icon name="warning" size={20}/></div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">Objeción de precio</p>
                                <p className="text-xs text-subtle">5:20 - 6:00</p>
                            </div>
                             <Icon name="play_circle" className="text-primary" size={24}/>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

const WebAnalysis = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-2xl mx-auto flex flex-col h-full justify-center">
             <header className="flex items-center mb-8 absolute top-4 left-4 md:static md:mb-8">
                 <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                 <h1 className="text-2xl font-bold md:text-center md:w-full md:ml-0 ml-2">Generador de Pitch IA</h1>
            </header>
             <div className="bg-surface p-8 rounded-3xl shadow-lg border border-gray-100">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 mx-auto">
                    <Icon name="auto_awesome" size={32} />
                </div>
                <h2 className="text-xl font-bold text-center mb-2">Analiza cualquier empresa</h2>
                <p className="text-subtle text-center mb-8 text-sm">Ingresa la URL del sitio web y nuestra IA generará un pitch de ventas personalizado en segundos.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text uppercase mb-2 ml-1">Sitio Web</label>
                        <div className="relative">
                            <Icon name="language" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder="https://www.ejemplo.com" className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium" />
                        </div>
                    </div>
                    <button className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                        <Icon name="analytics" className="text-white" /> Generar Pitch
                    </button>
                </div>
             </div>
        </div>
    );
};

const Practice = () => {
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col h-full relative">
            <header className="flex items-center mb-6 z-10">
                 <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                 <h1 className="text-2xl font-bold">Modo Práctica</h1>
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center relative">
                 {/* Visualizer Background Mockup */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                     <div className="flex items-end gap-1 h-32">
                         {[...Array(20)].map((_, i) => (
                             <div key={i} className="w-2 bg-primary rounded-t-full" style={{ height: `${Math.random() * 100}%` }}></div>
                         ))}
                     </div>
                 </div>

                 <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isRecording ? 'bg-red-100 scale-110 shadow-[0_0_0_15px_rgba(254,226,226,0.5)]' : 'bg-primary/10'}`}>
                    <Icon name="mic" size={48} className={`transition-colors duration-300 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
                 </div>
                 
                 <h2 className="text-2xl font-bold mb-2 text-center">{isRecording ? 'Escuchando...' : 'Listo para grabar'}</h2>
                 <p className="text-subtle mb-10 text-center max-w-xs mx-auto text-sm leading-relaxed">
                    {isRecording 
                        ? 'Habla con naturalidad. Analizaremos tu tono, claridad y ritmo en tiempo real.' 
                        : 'Presiona el botón para comenzar tu sesión de práctica de ventas.'}
                 </p>
                 
                 <button 
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 ${
                        isRecording 
                        ? 'bg-red-500 text-white shadow-red-500/30' 
                        : 'bg-primary text-white shadow-primary/30'
                    }`}
                >
                    {isRecording ? <><Icon name="stop" /> Detener Grabación</> : <><Icon name="mic" /> Comenzar</>}
                 </button>
            </div>
        </div>
    );
};

const Objections = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <header className="flex items-center mb-6">
                 <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                 <h1 className="text-2xl font-bold">Manejo de Objeciones</h1>
            </header>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_OBJECTIONS.map(obj => (
                    <div key={obj.id} className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                                <Icon name={obj.icon} className="text-gray-600 group-hover:text-primary transition-colors" size={24}/>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-subtle px-2 py-1 rounded-md">{obj.category}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-text">{obj.title}</h3>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                             <p className="text-sm text-subtle italic leading-relaxed">"{obj.response}"</p>
                        </div>
                        <div className="mt-4 flex items-center text-primary font-bold text-sm">
                            <span>Practicar respuesta</span>
                            <Icon name="arrow_forward" size={16} className="ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Settings = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8">
            <header className="flex items-center mb-6">
                 <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary md:hidden"><Icon name="arrow_back" /></button>
                 <h1 className="text-2xl font-bold">Ajustes</h1>
            </header>
            
            <div className="max-w-xl mx-auto space-y-6">
                <section>
                    <h2 className="text-sm font-bold text-subtle uppercase mb-3 ml-2">General</h2>
                    <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Icon name="notifications" size={20}/></div>
                                <span className="font-medium">Notificaciones Push</span>
                            </div>
                            <Toggle checked={true} onChange={() => {}} />
                        </div>
                        <div className="p-4 flex justify-between items-center border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Icon name="dark_mode" size={20}/></div>
                                <span className="font-medium">Modo Oscuro</span>
                            </div>
                            <Toggle checked={false} onChange={() => {}} />
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600"><Icon name="language" size={20}/></div>
                                <span className="font-medium">Idioma</span>
                            </div>
                            <div className="flex items-center gap-2 text-subtle cursor-pointer">
                                <span className="text-sm">Español</span>
                                <Icon name="chevron_right" size={20} />
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                     <h2 className="text-sm font-bold text-subtle uppercase mb-3 ml-2">Cuenta</h2>
                     <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <button onClick={() => navigate('/profile')} className="w-full p-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 text-left">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Icon name="person" size={20}/></div>
                                <span className="font-medium">Editar Perfil</span>
                            </div>
                            <Icon name="chevron_right" className="text-gray-300" size={20} />
                        </button>
                         <button className="w-full p-4 flex justify-between items-center hover:bg-gray-50 text-left">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><Icon name="lock" size={20}/></div>
                                <span className="font-medium">Privacidad y Seguridad</span>
                            </div>
                            <Icon name="chevron_right" className="text-gray-300" size={20} />
                        </button>
                     </div>
                </section>

                <button onClick={() => navigate('/login')} className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <Icon name="logout" size={20} /> Cerrar Sesión
                </button>
                
                <p className="text-center text-xs text-subtle mt-4">Versión 1.0.2 • PerfectCall AI</p>
            </div>
        </div>
    );
};

// --- APP COMPONENT ---

const App = () => {
    return (
        <HashRouter>
            <div className="font-sans antialiased text-text bg-background min-h-screen w-full flex overflow-hidden">
                <Sidebar />
                <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/scenarios" element={<Scenarios />} />
                        <Route path="/leads" element={<LeadsPage />} />
                        <Route path="/meetings" element={<MeetingsPage />} />
                        <Route path="/meetings/:id/results" element={<MeetingResultsPage />} />
                        <Route path="/web-analysis" element={<WebAnalysis />} />
                        <Route path="/web-history" element={<WebHistoryPage />} />
                        <Route path="/practice" element={<Practice />} />
                        <Route path="/analysis" element={<CallHistoryPage />} />
                        <Route path="/objections" element={<Objections />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                    <BottomNav />
                </main>
            </div>
        </HashRouter>
    );
};

export default App;