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

const AdminPage = () => {
    const [viewingUser, setViewingUser] = useState<{id: string, name: string, type: 'calls' | 'pitches'} | null>(null);

    if (viewingUser) {
        if (viewingUser.type === 'calls') {
            return <CallHistoryPage isUserView={true} userName={viewingUser.name} />;
        } else {
            return <WebHistoryPage isUserView={true} userName={viewingUser.name} />;
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
                                                    onClick={() => setViewingUser({id: '1', name: 'Ana Martinez', type: 'calls'})}
                                                    className="text-primary font-bold text-xs hover:underline"
                                                >
                                                    Ver Llamadas
                                                </button>
                                                <button 
                                                    onClick={() => setViewingUser({id: '1', name: 'Ana Martinez', type: 'pitches'})}
                                                    className="text-secondary font-bold text-xs hover:underline"
                                                >
                                                    Ver Pitches
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
                                                    onClick={() => setViewingUser({id: '2', name: 'Carlos Ruiz', type: 'calls'})}
                                                    className="text-primary font-bold text-xs hover:underline"
                                                >
                                                    Ver Llamadas
                                                </button>
                                                <button 
                                                    onClick={() => setViewingUser({id: '2', name: 'Carlos Ruiz', type: 'pitches'})}
                                                    className="text-secondary font-bold text-xs hover:underline"
                                                >
                                                    Ver Pitches
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

// --- NEW MEETING RESULTS PAGE ---

const MeetingResultsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notes, setNotes] = useState('');
    const [nextActions, setNextActions] = useState('');
    const [status, setStatus] = useState('contactado');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            navigate('/meetings');
        }, 1000);
    };

    const statusOptions = [
        { value: 'contactado', label: 'En contacto' },
        { value: 'reunión', label: 'Reunión programada' },
        { value: 'propuesta', label: 'Propuesta enviada' },
        { value: 'negociación', label: 'Negociación' },
    ];

    return (
        <div className="flex flex-col h-full bg-background relative">
             <header className="bg-surface px-6 py-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
                <h1 className="text-xl font-bold">Resultados de la reunión</h1>
                <button onClick={() => navigate('/meetings')} className="p-2 hover:bg-gray-100 rounded-full">
                    <Icon name="close" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 pb-24">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Notes Section */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-2">Notas de la reunión</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Escribe tus notas aquí..."
                            className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none text-sm"
                        ></textarea>
                    </div>

                    {/* Next Actions Section */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-2">Acciones siguientes</label>
                        <textarea
                            value={nextActions}
                            onChange={(e) => setNextActions(e.target.value)}
                            placeholder="Describe los siguientes pasos..."
                            className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none text-sm"
                        ></textarea>
                    </div>

                    {/* Lead Status Section */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Estado del lead</h3>
                        <div className="space-y-3">
                            {statusOptions.map((option) => (
                                <div 
                                    key={option.value}
                                    onClick={() => setStatus(option.value)}
                                    className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                                        status === option.value 
                                            ? 'bg-white border-primary border-2 shadow-sm' 
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="font-medium text-text">{option.label}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        status === option.value ? 'border-primary' : 'border-gray-300'
                                    }`}>
                                        {status === option.value && (
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-surface border-t border-gray-100 p-4 md:p-6 z-20">
                <div className="max-w-2xl mx-auto">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Guardando...
                            </>
                        ) : (
                            'Guardar resultados'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Scenarios = () => {
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Escenarios</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_SCENARIOS.map(scenario => (
                    <div key={scenario.id} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${scenario.avatarColor}`}>
                            <Icon name="person" />
                        </div>
                        <h3 className="font-bold text-lg text-text">{scenario.personaName}</h3>
                        <p className="text-sm text-subtle mb-2">{scenario.role} - {scenario.companyType}</p>
                        <p className="text-sm text-text mb-4">{scenario.description}</p>
                        <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                scenario.difficulty === 'Principiante' ? 'bg-green-100 text-green-700' :
                                scenario.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>{scenario.difficulty}</span>
                            <button className="text-primary font-bold text-sm hover:underline">Iniciar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LeadsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text">Leads</h1>
                <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                    <Icon name="add" className="text-white" /> Nuevo Lead
                </button>
            </div>
            <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-subtle uppercase">
                        <tr>
                            <th className="p-4">Nombre</th>
                            <th className="p-4 hidden md:table-cell">Empresa</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 hidden md:table-cell">Prioridad</th>
                            <th className="p-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_LEADS.map(lead => (
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-text">{lead.name}</p>
                                    <p className="text-xs text-subtle md:hidden">{lead.company}</p>
                                </td>
                                <td className="p-4 hidden md:table-cell text-text">{lead.company}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{lead.status}</span></td>
                                <td className="p-4 hidden md:table-cell text-text">{lead.priority}</td>
                                <td className="p-4 text-right">
                                    <button className="text-subtle hover:text-primary"><Icon name="more_vert" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MeetingsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text">Reuniones</h1>
                <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                    <Icon name="add" className="text-white" /> Agendar
                </button>
            </div>
            <div className="space-y-4">
                {MOCK_MEETINGS.map(meeting => (
                    <div key={meeting.id} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/meetings/${meeting.id}/results`)}>
                         <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary shrink-0">
                            <span className="text-xs font-bold uppercase">{meeting.date.split('-')[1]}</span>
                            <span className="text-lg font-bold">{meeting.date.split('-')[2]}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-text">{meeting.title}</h3>
                            <p className="text-sm text-subtle">{meeting.time} • {meeting.type} con {meeting.leadName}</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-primary font-bold text-xs bg-primary/5">
                            Completar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WebAnalysis = () => {
    const [url, setUrl] = useState('');
    const navigate = useNavigate();

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock analysis logic
        alert(`Analizando ${url}...`);
        setTimeout(() => {
             navigate('/web-history');
        }, 1000);
    };

    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-2xl mx-auto flex flex-col justify-center min-h-[80vh]">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <Icon name="language" size={40} />
                </div>
                <h1 className="text-3xl font-bold text-text">Generador de Pitch Web</h1>
                <p className="text-subtle">Ingresa la URL de un cliente potencial y generaremos el pitch de ventas perfecto analizando su sitio web.</p>
            </div>
            
            <form onSubmit={handleAnalyze} className="bg-surface p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-2 text-text">URL del Sitio Web</label>
                    <input 
                        type="url" 
                        required
                        placeholder="https://ejemplo.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-background text-text"
                    />
                </div>
                <button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Icon name="auto_awesome" className="text-white" />
                    Generar Pitch con IA
                </button>
            </form>

            <div className="text-center">
                <Link to="/web-history" className="text-primary font-bold hover:underline">Ver historial de análisis</Link>
            </div>
        </div>
    );
};

const Practice = () => {
    const [isRecording, setIsRecording] = useState(false);

    return (
         <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-2xl font-bold mb-8 text-text">Modo Práctica</h1>
            
            <div className="relative">
                <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-50 scale-110' : 'bg-primary/5'}`}>
                    <button 
                        onClick={() => setIsRecording(!isRecording)}
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary hover:scale-105'}`}
                    >
                        <Icon name={isRecording ? "stop" : "mic"} size={48} className="text-white" />
                    </button>
                </div>
            </div>
            
            <p className="text-lg font-medium text-subtle mt-8">
                {isRecording ? "Escuchando... Di tu pitch..." : "Presiona el micrófono para empezar"}
            </p>

            {isRecording && (
                <div className="w-64 h-12 bg-gray-100 rounded-full flex items-center justify-center gap-1 mt-6">
                    {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                        <div key={i} className="w-1 bg-primary rounded-full animate-bounce" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                </div>
            )}
         </div>
    );
};

const Objections = () => {
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-text">Manejador de Objeciones</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_OBJECTIONS.map(obj => (
                    <div key={obj.id} className="bg-surface p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-secondary/10 rounded-lg text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                <Icon name={obj.icon} size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-subtle uppercase tracking-wider">{obj.category}</span>
                                <h3 className="font-bold text-lg mb-2 text-text">{obj.title}</h3>
                                <p className="text-sm text-subtle line-clamp-2">{obj.response}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Settings = () => {
    return (
        <div className="p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-text">Ajustes</h1>
            <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg"><Icon name="person" className="text-text"/></div>
                        <div>
                            <p className="font-bold text-text">Perfil</p>
                            <p className="text-xs text-subtle">Editar información personal</p>
                        </div>
                    </div>
                    <Icon name="chevron_right" className="text-gray-400" />
                </div>
                 <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg"><Icon name="notifications" className="text-text"/></div>
                        <div>
                            <p className="font-bold text-text">Notificaciones</p>
                            <p className="text-xs text-subtle">Gestionar alertas</p>
                        </div>
                    </div>
                    <Icon name="chevron_right" className="text-gray-400" />
                </div>
                 <div className="p-4 flex items-center justify-between hover:bg-red-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg"><Icon name="logout" className="text-red-500" /></div>
                        <div>
                            <p className="font-bold text-red-500">Cerrar Sesión</p>
                        </div>
                    </div>
                </div>
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
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                    <BottomNav />
                </main>
            </div>
        </HashRouter>
    );
};

export default App;