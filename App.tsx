import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Icon } from './components/Icon';
import { WeeklyBarChart, SkillsRadarChart } from './components/Charts';
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
    { id: 1, title: 'Demo de Producto', leadId: 1, leadName: 'Ana Garcia', date: '2023-10-27', time: '10:00', type: 'Videollamada', status: 'Programada' },
    { id: 2, title: 'Reunión Inicial', leadId: 2, leadName: 'Pedro Martinez', date: '2023-10-28', time: '16:30', type: 'Llamada', status: 'Programada' },
    { id: 3, title: 'Revisión Contrato', leadId: 3, leadName: 'Lucia Lopez', date: '2023-10-30', time: '11:00', type: 'Presencial', status: 'Programada' },
];

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
                        <div className="p-2 bg-green-100 rounded-lg"><Icon name="emoji_events" className="text-green-500" size={20}/></div>
                        <span className="text-xs text-subtle">Score</span>
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

const LeadsPage = () => {
    const [filter, setFilter] = useState('');
    const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

    const filteredLeads = leads.filter(l => 
        l.name.toLowerCase().includes(filter.toLowerCase()) || 
        l.company.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="bg-surface p-4 md:p-6 border-b border-gray-100 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto w-full">
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90">
                        <Icon name="add" size={20} /> <span className="hidden sm:inline">Nuevo Lead</span>
                    </button>
                </div>
                <div className="relative max-w-7xl mx-auto w-full">
                    <Icon name="search" className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o empresa..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {filteredLeads.length > 0 ? filteredLeads.map(lead => (
                        <div key={lead.id} className="bg-surface p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-text text-lg">{lead.name}</h3>
                                    <p className="text-sm text-subtle">{lead.position} @ {lead.company}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    lead.priority === 'Alta' ? 'bg-red-100 text-red-600' :
                                    lead.priority === 'Media' ? 'bg-orange-100 text-orange-600' :
                                    'bg-green-100 text-green-600'
                                }`}>
                                    {lead.priority}
                                </span>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-sm text-subtle">
                                    <Icon name="email" size={16}/> <span className="truncate">{lead.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-subtle">
                                    <Icon name="phone" size={16}/> <span>{lead.phone}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{lead.status}</span>
                                <span className="font-bold text-text">{lead.value.toLocaleString()}€</span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-20">
                            <Icon name="group_off" size={64} className="text-gray-300 mb-4 mx-auto" />
                            <p className="text-subtle text-lg">No se encontraron leads</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MeetingsPage = () => {
    const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming');
    
    const filteredMeetings = tab === 'upcoming' 
        ? MOCK_MEETINGS.filter(m => m.status === 'Programada') 
        : MOCK_MEETINGS;

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="bg-surface p-4 md:p-6 border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Reuniones</h1>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90">
                            <Icon name="add" size={20} /> <span className="hidden sm:inline">Nueva</span>
                        </button>
                    </div>
                    <div className="flex gap-6 border-b border-gray-100">
                        <button 
                            onClick={() => setTab('upcoming')}
                            className={`pb-3 font-medium text-sm border-b-2 transition-colors px-1 ${tab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-subtle hover:text-text'}`}
                        >
                            Próximas
                        </button>
                        <button 
                            onClick={() => setTab('all')}
                            className={`pb-3 font-medium text-sm border-b-2 transition-colors px-1 ${tab === 'all' ? 'border-primary text-primary' : 'border-transparent text-subtle hover:text-text'}`}
                        >
                            Todas
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {filteredMeetings.map(meeting => (
                        <div key={meeting.id} className="bg-surface p-5 rounded-xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex flex-col items-center justify-center bg-background rounded-xl w-16 h-16 shrink-0 border border-gray-100">
                                <span className="text-xs font-bold text-red-500 uppercase">{new Date(meeting.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                                <span className="text-xl font-bold text-text">{new Date(meeting.date).getDate()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-text truncate pr-2">{meeting.title}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${meeting.status === 'Programada' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{meeting.status}</span>
                                </div>
                                <p className="text-sm text-subtle mb-2">{meeting.leadName}</p>
                                <div className="flex items-center gap-3 text-xs text-subtle">
                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Icon name="schedule" size={14}/> {meeting.time}</span>
                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Icon name="videocam" size={14}/> {meeting.type}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const WebAnalysis = () => {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<Pitch | null>(null);
    const [pitches, setPitches] = useState<Pitch[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('saved_pitches');
        if (saved) setPitches(JSON.parse(saved));
    }, []);

    const handleAnalyze = () => {
        if (!url) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            const newPitch: Pitch = {
                id: Date.now(),
                title: `Pitch para ${new URL(url).hostname}`,
                content: "Hola [Nombre], he analizado su sitio web y veo que están enfocados en [Beneficio Detectado]. Nuestra solución podría ayudarles a potenciar eso mediante [Propuesta de Valor]. ¿Tienen 10 minutos esta semana?",
                url: url,
                isFavorite: false,
                date: new Date().toLocaleDateString()
            };
            setResult(newPitch);
        }, 2000);
    };

    const savePitch = () => {
        if (result) {
            const updated = [result, ...pitches];
            setPitches(updated);
            localStorage.setItem('saved_pitches', JSON.stringify(updated));
            setResult(null);
            setUrl('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="bg-surface p-4 md:p-6 border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto w-full flex items-center">
                    <button onClick={() => window.history.back()} className="mr-3 md:hidden"><Icon name="arrow_back" /></button>
                    <h1 className="text-2xl font-bold">Generador de Pitch</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                    {!result ? (
                        <>
                            <div className="bg-surface p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 text-center max-w-2xl mx-auto w-full">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon name="auto_awesome" className="text-primary" size={40} />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Analizar Sitio Web</h2>
                                <p className="text-subtle mb-8">Ingresa la URL de un cliente potencial y nuestra IA generará un pitch de ventas personalizado.</p>
                                
                                <div className="relative mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="https://ejemplo.com" 
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full h-14 pl-6 pr-14 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary shadow-sm"
                                    />
                                    <button 
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="absolute right-2 top-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-md disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                    >
                                        {isAnalyzing ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Icon name="arrow_forward" size={24} />}
                                    </button>
                                </div>
                            </div>

                            {pitches.length > 0 && (
                                <div className="max-w-2xl mx-auto w-full">
                                    <h3 className="font-bold text-text mb-4 text-lg">Historial Reciente</h3>
                                    <div className="space-y-3">
                                        {pitches.map(p => (
                                            <div key={p.id} onClick={() => setResult(p)} className="bg-surface p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center group">
                                                <div>
                                                    <h4 className="font-bold text-sm truncate">{p.title}</h4>
                                                    <p className="text-xs text-subtle mt-1">{p.date}</p>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                    <Icon name="chevron_right" size={20} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex-1 flex flex-col max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <h3 className="font-bold text-xl text-text">Pitch Generado</h3>
                                <button onClick={() => setResult(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-subtle"><Icon name="close" /></button>
                            </div>
                            <textarea 
                                value={result.content}
                                readOnly
                                className="flex-1 w-full resize-none border-none focus:ring-0 text-text leading-relaxed text-base bg-transparent p-0"
                            />
                            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                                <button onClick={savePitch} className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors">Guardar</button>
                                <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">Copiar al portapapeles</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Practice = () => {
    const [state, setState] = useState<'setup' | 'active' | 'feedback'>('setup');
    const [selectedPitch, setSelectedPitch] = useState<string>('');
    const [duration, setDuration] = useState(0);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (state === 'active') {
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        } else {
            clearInterval(timerRef.current);
            if (state === 'setup') setDuration(0);
        }
        return () => clearInterval(timerRef.current);
    }, [state]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (state === 'setup') {
        return (
            <div className="flex flex-col h-full bg-background">
                <header className="bg-surface p-4 md:p-6 border-b border-gray-100 sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-center md:text-left md:max-w-7xl md:mx-auto">Modo Práctica</h1>
                </header>
                <div className="p-6 flex flex-col items-center justify-center flex-1 max-w-2xl mx-auto w-full">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                        <Icon name="mic" className="text-primary" size={64} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-center">¿Qué quieres practicar hoy?</h2>
                    <p className="text-subtle text-center text-base mb-10 max-w-md">Selecciona un pitch guardado o practica libremente para mejorar tu entonación y velocidad.</p>
                    
                    <select 
                        className="w-full mb-6 p-4 rounded-xl border border-gray-200 bg-surface shadow-sm focus:ring-2 focus:ring-primary"
                        value={selectedPitch}
                        onChange={(e) => setSelectedPitch(e.target.value)}
                    >
                        <option value="">🎤 Práctica Libre (Sin guión)</option>
                        <option value="pitch1">📄 Pitch para TechSolutions</option>
                    </select>

                    <button 
                        onClick={() => setState('active')}
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Icon name="mic" /> Iniciar Grabación
                    </button>
                </div>
            </div>
        );
    }

    if (state === 'active') {
        return (
            <div className="flex flex-col h-full bg-secondary text-white relative overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <h2 className="text-6xl font-mono font-bold mb-8 tracking-wider">{formatTime(duration)}</h2>
                    <div className="w-48 h-48 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse mb-12">
                        <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                            <Icon name="mic" size={56} />
                        </div>
                    </div>
                    <p className="opacity-70 mb-12 text-lg uppercase tracking-widest font-bold">Grabando...</p>
                    <button 
                        onClick={() => setState('feedback')}
                        className="px-10 py-4 bg-white/10 backdrop-blur-md rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all text-lg"
                    >
                        Detener Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="bg-surface p-4 border-b border-gray-100 text-center md:text-left">
                <h1 className="text-xl font-bold md:max-w-7xl md:mx-auto">Resultados</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-6 pb-24 md:pb-8">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-white text-center shadow-xl">
                        <p className="text-sm opacity-90 mb-2 uppercase tracking-wide font-bold">Puntuación Global</p>
                        <div className="text-7xl font-bold mb-4">85</div>
                        <div className="flex justify-center gap-2">
                            {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={24} className={i <= 4 ? "text-yellow-400" : "text-white/30"} />)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold mb-4">Métricas de Voz</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-text">Claridad</span>
                                        <span className="text-sm font-bold text-primary">90%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary w-[90%] rounded-full"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-text">Ritmo</span>
                                        <span className="text-sm font-bold text-orange-500">65%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 w-[65%] rounded-full"></div></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                             <h3 className="font-bold mb-4">Feedback IA</h3>
                             <ul className="space-y-3">
                                 <li className="flex gap-3 text-sm text-subtle">
                                     <Icon name="check_circle" className="text-green-500 shrink-0" size={20} />
                                     <span>Buena entonación al inicio de la llamada.</span>
                                 </li>
                                 <li className="flex gap-3 text-sm text-subtle">
                                     <Icon name="warning" className="text-orange-500 shrink-0" size={20} />
                                     <span>Hablaste un poco rápido durante la propuesta de valor.</span>
                                 </li>
                             </ul>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button onClick={() => setState('setup')} className="flex-1 py-4 bg-white border border-gray-200 rounded-xl font-bold text-subtle hover:bg-gray-50 transition-colors">Salir</button>
                        <button onClick={() => setState('active')} className="flex-1 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Reintentar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Objections = () => {
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const categories = ['Todas', 'Precio', 'Tiempo', 'Competencia', 'Necesidad'];

    const filteredObjections = selectedCategory === 'Todas' 
        ? MOCK_OBJECTIONS 
        : MOCK_OBJECTIONS.filter(obj => obj.category === selectedCategory);

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="bg-surface p-4 md:p-6 border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <h1 className="text-2xl font-bold text-center md:text-left mb-6">Biblioteca de Objeciones</h1>
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible pb-2">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                                    selectedCategory === cat ? 'bg-secondary text-white' : 'bg-background text-subtle border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {filteredObjections.map(obj => (
                        <div key={obj.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Icon name={obj.icon} size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text text-lg leading-tight">"{obj.title}"</h3>
                                    <span className="text-xs font-bold text-subtle bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{obj.category}</span>
                                </div>
                            </div>
                            <div className="bg-background p-4 rounded-xl text-sm text-text border border-gray-100 leading-relaxed flex-1">
                                {obj.response}
                            </div>
                            <button className="mt-4 w-full py-2 text-primary font-bold text-sm hover:bg-primary/5 rounded-lg transition-colors">
                                Practicar respuesta
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Scenarios = () => {
    return (
        <div className="flex flex-col h-full bg-background">
            <header className="bg-surface p-4 md:p-6 border-b border-gray-100 sticky top-0 z-10">
                <h1 className="text-2xl font-bold max-w-7xl mx-auto w-full">Escenarios</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {MOCK_SCENARIOS.map(scenario => (
                        <div key={scenario.id} className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${scenario.avatarColor}`}>
                                        {scenario.personaName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text text-lg">{scenario.personaName}</h3>
                                        <p className="text-xs text-subtle font-medium">{scenario.role} • {scenario.companyType}</p>
                                    </div>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded bg-gray-100 text-xs font-bold text-subtle uppercase w-fit mb-3">{scenario.difficulty}</span>
                            <p className="text-sm text-text mb-6 leading-relaxed flex-1">{scenario.description}</p>
                            <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors">Iniciar Simulación</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col h-full bg-background">
             <header className="bg-surface p-4 md:p-6 border-b border-gray-100 flex items-center sticky top-0 z-10">
                <button onClick={() => window.history.back()} className="mr-3 md:hidden"><Icon name="arrow_back" /></button>
                <h1 className="text-2xl font-bold max-w-2xl mx-auto w-full md:pl-0 pl-2">Ajustes</h1>
            </header>
            <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto w-full">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold mb-6 text-lg">Cuenta</h3>
                    <div className="flex items-center justify-between py-4 border-b border-gray-50">
                        <div>
                             <span className="text-base font-medium text-text block">Notificaciones</span>
                             <span className="text-xs text-subtle">Recibe alertas sobre tus reuniones</span>
                        </div>
                        <div className="w-12 h-7 bg-primary rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div></div>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div>
                             <span className="text-base font-medium text-text block">Modo Oscuro</span>
                             <span className="text-xs text-subtle">Interfaz con colores oscuros</span>
                        </div>
                        <div className="w-12 h-7 bg-gray-200 rounded-full relative cursor-pointer"><div className="w-5 h-5 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div></div>
                    </div>
                </div>
                
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="font-bold mb-6 text-lg">Suscripción</h3>
                     <div className="bg-background p-4 rounded-xl mb-4">
                         <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-text">Plan Pro</span>
                             <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded">ACTIVO</span>
                         </div>
                         <p className="text-xs text-subtle">Próxima renovación: 24 Oct 2023</p>
                     </div>
                     <button className="text-primary text-sm font-bold hover:underline">Gestionar facturación</button>
                </div>

                <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <Icon name="logout" /> Cerrar Sesión
                </button>
                
                <p className="text-center text-xs text-subtle pt-4">Version 1.2.0</p>
            </div>
        </div>
    );
};

const AnalysisPage = () => {
    return (
         <div className="flex flex-col h-full bg-background">
            <header className="bg-surface p-4 md:p-6 border-b border-gray-100 text-center md:text-left sticky top-0 z-10">
                <h1 className="text-2xl font-bold max-w-7xl mx-auto w-full">Progreso de Entrenamiento</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-7xl mx-auto w-full space-y-6">
                    {/* Score Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border-l-4 border-primary">
                            <p className="text-sm text-subtle mb-1">Simulaciones</p>
                            <p className="text-3xl font-bold text-text">24</p>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border-l-4 border-accent">
                            <p className="text-sm text-subtle mb-1">Nota Media</p>
                            <p className="text-3xl font-bold text-text">8.5</p>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border-l-4 border-warning">
                            <p className="text-sm text-subtle mb-1">Racha</p>
                            <p className="text-3xl font-bold text-text">5 días</p>
                        </div>
                         <div className="bg-surface p-6 rounded-2xl shadow-sm border-l-4 border-danger">
                            <p className="text-sm text-subtle mb-1">Objeciones</p>
                            <p className="text-3xl font-bold text-text">150</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Weekly Chart */}
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-text mb-6 text-lg">Constancia Semanal</h3>
                            <div className="h-64">
                                <WeeklyBarChart 
                                    labels={['L', 'M', 'X', 'J', 'V', 'S', 'D']} 
                                    data={[2, 4, 1, 5, 3, 0, 0]} 
                                />
                            </div>
                        </div>

                        {/* Skills Radar */}
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-text mb-6 text-lg">Mapa de Habilidades</h3>
                            <div className="h-64 w-full">
                                <SkillsRadarChart scores={[60, 85, 45, 70, 75]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                        <Route path="/web-analysis" element={<WebAnalysis />} />
                        <Route path="/practice" element={<Practice />} />
                        <Route path="/analysis" element={<AnalysisPage />} />
                        <Route path="/objections" element={<Objections />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                    <BottomNav />
                </main>
            </div>
        </HashRouter>
    );
};

export default App;