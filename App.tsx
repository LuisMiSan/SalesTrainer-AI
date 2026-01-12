import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Icon } from './components/Icon';
import { WeeklyBarChart, EvolutionLineChart } from './components/Charts';
import { WelcomeCard, StreakCard, QuickActionsGrid, SkillProgressCard } from './components/DashboardWidgets'; // Import new widgets
import { Scenario, Objection, Lead, Meeting, Pitch } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './utils/api';

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

const CHART_DATA = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    confidence: [50, 55, 50, 85, 90, 80, 85],
    clarity:    [20, 30, 25, 60, 85, 80, 80],
    empathy:    [15, 15, 15, 15, 55, 60, 70] 
};

const ACHIEVEMENTS = [
    { id: 1, title: "¡Top 10 en Claridad!", description: "Tu puntuación de claridad está en el ranking.", icon: "military_tech", color: "bg-blue-500" },
    { id: 2, title: "Mejora notable en Empatía", description: "+15% vs la semana pasada.", icon: "trending_up", color: "bg-blue-400" }
];

//Helper
const getStatusDotColor = (status: string) => {
    switch (status) {
        case 'Propuesta': return 'bg-yellow-500';
        case 'Contactado': return 'bg-green-500';
        case 'Negociación': return 'bg-blue-500';
        case 'Ganado': return 'bg-green-600';
        default: return 'bg-gray-400';
    }
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

// --- SETTINGS SUB-COMPONENTS ---
const SettingsProfile = () => {
    const { user, login, token } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: user?.company || '',
        username: user?.username || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.put('/auth/profile', formData);
            if (res.success && token) {
                login(token, res.user); // Update local user state
                alert('Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error(error);
            alert('Error al actualizar perfil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary">
                    <Icon name="arrow_back" />
                </button>
                <h1 className="text-2xl font-bold text-text">Editar Perfil</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full p-3 bg-background rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Usuario</label>
                        <input 
                            type="text" 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full p-3 bg-background rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full p-3 bg-background rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Empresa</label>
                        <input 
                            type="text" 
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="w-full p-3 bg-background rounded-xl border border-gray-200 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
};

const SettingsNotifications = () => {
    const { user, login, token } = useAuth();
    const navigate = useNavigate();
    // Use preferences from user object, default to true if undefined for better UX initially
    const [prefs, setPrefs] = useState({
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
        weeklySummary: user?.preferences?.notifications?.weeklySummary ?? false,
        aiFeedback: user?.preferences?.notifications?.aiFeedback ?? false
    });

    const toggle = async (key: keyof typeof prefs) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        
        try {
            const res = await api.put('/auth/profile', {
                preferences: { notifications: newPrefs }
            });
            if (res.success && token) {
                login(token, res.user);
            }
        } catch (error) {
            console.error('Error updating notifications', error);
        }
    };

    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary">
                    <Icon name="arrow_back" />
                </button>
                <h1 className="text-2xl font-bold text-text">Notificaciones</h1>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {[
                    { key: 'email', label: 'Notificaciones por Email', desc: 'Recibe resúmenes y alertas importantes.' },
                    { key: 'push', label: 'Notificaciones Push', desc: 'Alertas inmediatas en tu dispositivo.' },
                    { key: 'weeklySummary', label: 'Resumen Semanal', desc: 'Un reporte de tu progreso cada lunes.' },
                    { key: 'aiFeedback', label: 'Feedback de IA', desc: 'Avisos cuando tu análisis esté listo.' }
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                        <div>
                            <h3 className="font-bold text-gray-900">{item.label}</h3>
                            <p className="text-xs text-subtle">{item.desc}</p>
                        </div>
                        <button 
                            onClick={() => toggle(item.key as keyof typeof prefs)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${prefs[item.key as keyof typeof prefs] ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${prefs[item.key as keyof typeof prefs] ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsSubscription = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isPro = user?.subscription?.plan === 'pro' || user?.subscription?.plan === 'enterprise';

    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary">
                    <Icon name="arrow_back" />
                </button>
                <h1 className="text-2xl font-bold text-text">Suscripción</h1>
            </header>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Icon name="diamond" size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Plan Actual: {isPro ? 'PRO' : 'Gratuito'}</h2>
                <p className="text-subtle text-sm mt-2">
                    {isPro ? 'Tu próxima renovación es el 12/12/2024' : 'Desbloquea todo el potencial de la IA.'}
                </p>
            </div>

            {!isPro && (
                <div className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-3xl shadow-lg text-white">
                    <h3 className="text-lg font-bold mb-2">Pásate a PRO</h3>
                    <ul className="space-y-2 text-sm opacity-90 mb-6">
                        <li className="flex items-center gap-2"><Icon name="check" size={16} /> Pitches ilimitados</li>
                        <li className="flex items-center gap-2"><Icon name="check" size={16} /> Análisis avanzado de voz</li>
                        <li className="flex items-center gap-2"><Icon name="check" size={16} /> Escenarios personalizados</li>
                    </ul>
                    <button className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-50 transition-colors">
                        Mejorar Plan - $29/mes
                    </button>
                </div>
            )}
        </div>
    );
};

const SettingsHelp = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-3 text-subtle hover:text-primary">
                    <Icon name="arrow_back" />
                </button>
                <h1 className="text-2xl font-bold text-text">Ayuda y Soporte</h1>
            </header>
            
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">Preguntas Frecuentes</h3>
                    <p className="text-sm text-subtle">Revisa nuestra documentación para resolver dudas rápidas.</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">Contactar Soporte</h3>
                    <p className="text-sm text-subtle mb-3">¿Tienes un problema? Escríbenos.</p>
                    <a href="mailto:soporte@perfectcall.ai" className="text-primary font-bold text-sm">soporte@perfectcall.ai</a>
                </div>
                <div className="text-center pt-8 text-xs text-gray-400">
                    <p>PerfectCall AI v1.0.0</p>
                    <p>Hecho con ❤️ para vendedores</p>
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout();
            navigate('/login');
        }
    };

    const menuItems = [
        { label: 'Perfil', path: '/settings/profile' },
        { label: 'Notificaciones', path: '/settings/notifications' },
        { label: 'Suscripción', path: '/settings/subscription' },
        { label: 'Ayuda', path: '/settings/help' },
    ];

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
    };

    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            <h1 className="text-2xl font-bold text-text mb-6">Configuración</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg">
                        {getInitials(user?.name || '')}
                     </div>
                     <div>
                         <h3 className="font-bold text-gray-900">{user?.name || 'Usuario'}</h3>
                         <p className="text-sm text-subtle capitalize">{user?.role === 'admin' ? 'Administrador' : user?.company || 'Usuario'}</p>
                     </div>
                </div>
                <div className="p-2">
                    {menuItems.map((item) => (
                        <button 
                            key={item.label} 
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
                        >
                            <span className="text-gray-700 font-medium">{item.label}</span>
                            <Icon name="chevron_right" className="text-gray-400" />
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={handleLogout}
                        className="w-full text-red-500 font-bold py-2 text-center hover:bg-red-50 rounded-xl transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- RESTORED & ENHANCED DASHBOARD ---
const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);

    // Fetch dashboard stats (streak, etc)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/leads/stats/dashboard');
                if (res.success && res.stats.user) {
                   setStreak(res.stats.user.streak || 0);
                }
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            }
        };
        fetchStats();
    }, []);
    
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col justify-between overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="flex-grow">
                {/* HEADER */}
                <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark sticky top-0 z-10">
                    <div className="w-12"></div>
                    <h1 className="flex-1 text-center text-lg font-bold text-foreground-light dark:text-foreground-dark">Inicio</h1>
                    <div className="flex w-12 items-center justify-end">
                        <button 
                            onClick={() => navigate('/settings')}
                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-foreground-light dark:text-foreground-dark"
                        >
                            <span className="material-symbols-outlined text-2xl">settings</span>
                        </button>
                    </div>
                </header>

                <main className="px-4 pb-8 space-y-4">
                    
                    {/* 1. WELCOME CARD (NEW) */}
                    <WelcomeCard userName={user?.name || "Usuario"} />

                    {/* 2. STREAK CARD (NEW) */}
                    <StreakCard days={streak} />

                    {/* 3. QUICK ACTIONS GRID (NEW) */}
                    <QuickActionsGrid />

                    {/* 4. WEEKLY PROGRESS (NEW - BARS) */}
                    {/* Static values for now based on image, real values would come from API */}
                    <SkillProgressCard confidence={85} clarity={60} empathy={90} />

                    {/* 5. LEADS RECIENTES (EXISTING - KEPT) */}
                    <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-900">Leads Recientes</h3>
                            <button onClick={() => navigate('/leads')} className="text-sm text-primary hover:underline">Ver todos</button>
                        </div>
                        <div className="space-y-4">
                            {MOCK_LEADS.slice(0, 3).map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/leads')}>
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={lead.avatar || `https://ui-avatars.com/api/?name=${lead.name}&background=random`} 
                                            alt={lead.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{lead.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-500">
                                                    {lead.status === 'Propuesta' ? 'Propuesta enviada' : lead.status === 'Contactado' ? 'Primer contacto' : lead.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400 text-lg">chevron_right</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

// ... (Rest of existing components: LeadsPage, WebAnalysis, etc. remain unchanged) ...
// --- RESTORED LEADS PAGE (Was Empty) ---
const LeadsPage = () => (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-text">Gestión de Leads</h1>
            <button className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                <Icon name="add" />
            </button>
        </header>
        <div className="space-y-3">
             {MOCK_LEADS.map((lead) => (
                <div key={lead.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img 
                            src={lead.avatar || `https://ui-avatars.com/api/?name=${lead.name}&background=random`} 
                            alt={lead.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h4 className="font-bold text-gray-900">{lead.name}</h4>
                            <p className="text-xs text-subtle">{lead.company} • {lead.position}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${getStatusDotColor(lead.status)}`}></span>
                                <span className="text-xs text-gray-500">{lead.status}</span>
                            </div>
                        </div>
                    </div>
                     <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
            ))}
        </div>
    </div>
);

// --- RESTORED WEB ANALYSIS PAGE (Was Empty) ---
const WebAnalysis = () => (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Análisis Web</h1>
        <p className="text-subtle mb-6">Genera un pitch de ventas analizando una URL.</p>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                    <Icon name="language" />
                </div>
                <h3 className="font-bold text-gray-900">Nueva URL</h3>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="https://ejemplo.com" 
                    className="flex-1 bg-background border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
                <button className="bg-primary text-white px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
                    Analizar
                </button>
            </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-4 px-1">Análisis Recientes</h3>
        <div className="space-y-3">
            {MOCK_PENDING_PITCHES.map((pitch) => (
                <div key={pitch.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{pitch.title}</h4>
                        <span className="text-xs text-subtle">{pitch.date}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-primary text-xs px-2 py-1 rounded-md font-medium">
                            {pitch.status === 'pending_review' ? 'En Revisión' : 'Completado'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- RESTORED OBJECTIONS PAGE (Was Empty) ---
const Objections = () => {
    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            <h1 className="text-2xl font-bold text-text mb-6">Objeciones Comunes</h1>
            <div className="grid grid-cols-1 gap-4">
                {MOCK_OBJECTIONS.map((obj) => (
                    <div key={obj.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-warning shrink-0">
                                <Icon name={obj.icon} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 mb-1">{obj.title}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{obj.category}</span>
                                </div>
                                <p className="text-sm text-subtle mb-3">Respuesta sugerida:</p>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-xl text-sm italic border-l-4 border-warning">
                                    "{obj.response}"
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- RESTORED PRACTICE PAGE (Was Empty) ---
const Practice = () => {
    return (
         <div className="p-4 md:p-8 pb-20 md:pb-8">
            <h1 className="text-2xl font-bold text-text mb-6">Sala de Práctica</h1>
            <p className="text-subtle mb-6">Elige un escenario para comenzar a entrenar con la IA.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_SCENARIOS.map((scenario) => (
                    <div key={scenario.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    scenario.difficulty === 'Principiante' ? 'bg-green-100 text-green-700' :
                                    scenario.difficulty === 'Intermedio' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {scenario.difficulty}
                                </span>
                                {scenario.status === 'Bloqueado' && <Icon name="lock" className="text-gray-300" />}
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{scenario.personaName}</h3>
                            <p className="text-sm text-primary font-medium mb-2">{scenario.role} en {scenario.companyType}</p>
                            <p className="text-sm text-subtle mb-6 line-clamp-2">{scenario.description}</p>
                            
                            <button className="w-full py-3 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 font-bold rounded-xl transition-all">
                                {scenario.status === 'Bloqueado' ? 'Desbloquear' : 'Practicar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- RESTORED ANALYSIS PAGE (Was Empty) ---
const AnalysisPage = () => {
    return (
         <div className="p-4 md:p-8 pb-20 md:pb-8">
            <h1 className="text-2xl font-bold text-text mb-6">Análisis de Rendimiento</h1>
            
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6">Evolución de Habilidades</h3>
                    <div className="h-64">
                         <EvolutionLineChart 
                                labels={CHART_DATA.labels}
                                confidenceData={CHART_DATA.confidence}
                                clarityData={CHART_DATA.clarity}
                                empathyData={CHART_DATA.empathy}
                            />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                     <h3 className="font-bold text-gray-900 mb-6">Desglose Semanal</h3>
                     <div className="h-64">
                        <WeeklyBarChart 
                            labels={CHART_DATA.labels}
                            data={[65, 59, 80, 81, 56, 55, 40]}
                        />
                     </div>
                </div>
            </div>
        </div>
    );
};

// ... other components placeholders ...
const CreateObjectionPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Crear Objeción</h1><p className="text-subtle">Formulario para añadir nueva objeción.</p></div>;
const Scenarios = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Escenarios</h1><p className="text-subtle">Escenarios de práctica disponibles.</p></div>;
const MeetingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Reuniones</h1><p className="text-subtle">Calendario de reuniones.</p></div>;
const MeetingResultsPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Resultados de Reunión</h1><p className="text-subtle">Análisis y detalles de la reunión.</p></div>;
const ManualPitchPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Pitch Manual</h1><p className="text-subtle">Crear pitch manualmente.</p></div>;
const SubscriptionSuccessPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4 text-green-600">¡Suscripción Exitosa!</h1><p className="text-subtle">Gracias por suscribirte.</p></div>;
const WebHistoryPage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Historial</h1><p className="text-subtle">Historial de pitches.</p></div>;
const ProfilePage = () => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Perfil</h1><p className="text-subtle">Detalles del usuario.</p></div>;


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
                {/* Simplified placeholders for user details within admin for now */}
                <div className="p-4 bg-white rounded-xl shadow-sm">Detalles de {viewingUser.name}</div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* System-wide Pending Pitches */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                             <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-900">Resumen Operativo</h3>
                                <span className="bg-blue-100 text-primary text-xs font-bold px-2 py-1 rounded-full">Hoy</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                                            <Icon name="pending_actions" size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Pitches Pendientes de Revisión</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">42</span>
                                </div>
                                <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <Icon name="check_circle" size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Leads Convertidos</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">15</span>
                                </div>
                            </div>
                        </div>

                        {/* Global Skill Evolution Chart */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-base font-bold text-[#2C3E50]">Tendencia Global de Habilidades</h3>
                            </div>
                            <div className="h-48">
                                <EvolutionLineChart 
                                    labels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']} 
                                    confidenceData={[65, 68, 72, 75]}
                                    clarityData={[60, 65, 70, 74]}
                                    empathyData={[70, 72, 74, 78]}
                                />
                            </div>
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
                        <Route path="/analysis" element={<AnalysisPage />} />
                        
                        {/* User & Settings */}
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/settings/profile" element={<SettingsProfile />} />
                        <Route path="/settings/notifications" element={<SettingsNotifications />} />
                        <Route path="/settings/subscription" element={<SettingsSubscription />} />
                        <Route path="/settings/help" element={<SettingsHelp />} />
                        <Route path="/profile" element={<ProfilePage />} />
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