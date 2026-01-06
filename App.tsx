import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Icon } from './components/Icon';
import { WeeklyBarChart, SkillsRadarChart } from './components/Charts';
import { Scenario, Objection } from './types';

// --- MOCK DATA FOR TRAINING ---
const MOCK_SCENARIOS: Scenario[] = [
    { 
        id: 1, 
        personaName: 'Marta (Gatekeeper)', 
        role: 'Recepcionista', 
        companyType: 'Consultora', 
        difficulty: 'Principiante', 
        status: 'Disponible', 
        avatarColor: 'bg-green-100 text-green-600',
        description: 'Marta protege el acceso al CEO. Tu objetivo es conseguir agendar una llamada con su jefe.'
    },
    { 
        id: 2, 
        personaName: 'Carlos (Escéptico)', 
        role: 'Director Técnico', 
        companyType: 'SaaS', 
        difficulty: 'Intermedio', 
        status: 'Disponible', 
        avatarColor: 'bg-orange-100 text-orange-600',
        description: 'Carlos ha tenido malas experiencias con herramientas similares. Debes ganar su confianza técnica.'
    },
    { 
        id: 3, 
        personaName: 'Elena (Presupuesto)', 
        role: 'CFO', 
        companyType: 'Retail', 
        difficulty: 'Avanzado', 
        status: 'Bloqueado', 
        avatarColor: 'bg-purple-100 text-purple-600',
        description: 'Elena solo le importan los números. Debes justificar el ROI inmediatamente.'
    },
    { 
        id: 4, 
        personaName: 'David (Apurado)', 
        role: 'Gerente de Ventas', 
        companyType: 'Inmobiliaria', 
        difficulty: 'Avanzado', 
        status: 'Bloqueado', 
        avatarColor: 'bg-red-100 text-red-600',
        description: 'Tienes 30 segundos para captar su atención antes de que cuelgue.'
    },
];

const MOCK_OBJECTIONS: Objection[] = [
    { id: 1, title: 'Es demasiado caro', category: 'Precio', icon: 'payments', response: 'Entiendo que el presupuesto es clave. Sin embargo, nuestros clientes suelen ver un ROI de 3x en los primeros 6 meses. ¿Le gustaría ver un desglose?' },
    { id: 2, title: 'No tengo tiempo', category: 'Tiempo', icon: 'schedule', response: 'Comprendo perfectamente. Solo necesito 10 minutos para mostrarle cómo nuestra herramienta le ahorrará 5 horas semanales a su equipo.' },
    { id: 3, title: 'Ya uso otra solución', category: 'Competencia', icon: 'compare_arrows', response: 'Es genial que ya estén abordando este problema. ¿Qué es lo que más le gusta de su solución actual y qué le gustaría mejorar?' },
    { id: 4, title: 'Necesito consultarlo', category: 'Autoridad', icon: 'group', response: 'Totalmente comprensible. ¿Qué información específica necesitaría su socio para tomar una decisión informada? Puedo preparar un resumen ejecutivo.' },
];

// --- PAGES ---

const LoginPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-surface flex flex-col justify-center px-6">
            <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                    <Icon name="school" className="text-primary" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-text mb-2">SalesTrainer AI</h1>
                <p className="text-subtle">Tu simulador de ventas personal.</p>
                <p className="text-sm text-subtle mt-2">Practica, falla y aprende con la IA antes de quemar leads reales.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-text mb-1 block">Email Corporativo</label>
                    <input type="email" placeholder="trainee@empresa.com" className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                </div>
                <div>
                    <label className="text-sm font-medium text-text mb-1 block">Contraseña</label>
                    <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <span>Entrar al Dojo</span>
                    <Icon name="arrow_forward" size={20} />
                </button>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 pb-24 space-y-6">
            <header className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-2xl font-bold text-text">Dojo de Ventas 🥋</h1>
                    <p className="text-sm text-subtle">Nivel Actual: Junior SDR</p>
                </div>
                <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-surface border border-gray-100 flex items-center justify-center text-text hover:bg-gray-50">
                    <Icon name="settings" size={20} />
                </button>
            </header>

            {/* Streak Card */}
            <div className="bg-gradient-to-r from-secondary to-[#34495e] p-5 rounded-2xl shadow-lg text-white flex items-center justify-between">
                <div>
                    <p className="font-bold text-lg">Objetivo Semanal</p>
                    <p className="text-xs text-gray-300 opacity-90">Completa 3 simulaciones más</p>
                    <div className="w-32 h-2 bg-white/20 rounded-full mt-2">
                        <div className="w-2/3 h-full bg-accent rounded-full"></div>
                    </div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl border border-white/20">
                    🎯
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate('/practice')} className="bg-primary p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Icon name="mic" className="text-white" size={28} />
                    </div>
                    <span className="text-sm font-bold text-white">Simulación Rápida</span>
                </button>
                <button onClick={() => navigate('/create')} className="bg-surface p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 border border-gray-100 active:scale-95 transition-transform">
                    <Icon name="edit_document" className="text-secondary" size={32} />
                    <span className="text-sm font-bold text-secondary">Crear Guión</span>
                </button>
            </div>

            {/* Skills Radar */}
            <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-text">Tus Habilidades</h3>
                    <Link to="/analysis" className="text-xs text-primary font-bold">Ver Detalles</Link>
                </div>
                <div className="h-48 w-full">
                    <SkillsRadarChart scores={[60, 85, 45, 70, 75]} />
                </div>
                <p className="text-xs text-center text-subtle mt-2">Necesitas mejorar en: <span className="font-bold text-danger">Empatía</span></p>
            </div>

            {/* Recommended Scenarios */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-text">Siguientes Retos</h3>
                </div>
                <div className="space-y-3">
                    {MOCK_SCENARIOS.slice(0, 2).map(scenario => (
                        <div key={scenario.id} onClick={() => navigate('/scenarios')} className="bg-surface p-3 rounded-xl border border-gray-100 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${scenario.avatarColor}`}>
                                    {scenario.personaName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-text">{scenario.personaName}</p>
                                    <p className="text-xs text-subtle">{scenario.role} • {scenario.difficulty}</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 rounded-lg bg-background text-xs font-bold text-primary">
                                Entrenar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Scenarios = () => {
    const [filter, setFilter] = useState('Todos');
    
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="bg-surface p-4 border-b border-gray-100 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-center mb-4">Escenarios de Práctica</h1>
                <p className="text-xs text-center text-subtle mb-4 px-4">Selecciona un personaje de IA para practicar. Cada uno tiene personalidad y objeciones únicas.</p>
                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 justify-center">
                    {['Todos', 'Principiante', 'Intermedio', 'Avanzado'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-secondary text-white' : 'bg-background text-subtle'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
                {MOCK_SCENARIOS.map(scenario => (
                    <div key={scenario.id} className={`bg-surface p-4 rounded-xl shadow-sm border-l-4 ${scenario.status === 'Bloqueado' ? 'border-gray-300 opacity-70' : 'border-primary'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${scenario.avatarColor}`}>
                                    {scenario.personaName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-text flex items-center gap-2">
                                        {scenario.personaName}
                                        {scenario.status === 'Bloqueado' && <Icon name="lock" size={14} className="text-subtle"/>}
                                    </h3>
                                    <p className="text-xs text-subtle font-medium">{scenario.role} @ {scenario.companyType}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                scenario.difficulty === 'Principiante' ? 'bg-green-100 text-green-700' :
                                scenario.difficulty === 'Intermedio' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {scenario.difficulty}
                            </span>
                        </div>
                        
                        <p className="text-xs text-subtle mt-2 mb-3 leading-relaxed">{scenario.description}</p>
                        
                        {scenario.status !== 'Bloqueado' ? (
                            <Link to="/practice" className="block w-full py-2.5 bg-primary/10 text-primary font-bold text-sm rounded-xl text-center hover:bg-primary hover:text-white transition-colors">
                                Iniciar Simulación
                            </Link>
                        ) : (
                            <div className="w-full py-2.5 bg-gray-100 text-subtle font-bold text-sm rounded-xl text-center flex items-center justify-center gap-2">
                                <Icon name="lock" size={16} />
                                Completa el anterior
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CreateScript = () => {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [script, setScript] = useState<string | null>(null);

    const handleGenerate = () => {
        if (!topic) return;
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            setIsGenerating(false);
            setScript(`**Apertura:**\n"Hola [Nombre], soy Alex de SalesAI. He visto que están expandiendo su equipo comercial..."\n\n**Propuesta de Valor:**\n"Ayudamos a entrenar a los nuevos SDRs un 50% más rápido usando simulación de voz..."\n\n**Cierre:**\n"¿Cómo están manejando el onboarding actualmente?"`);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="bg-surface p-4 border-b border-gray-100 text-center sticky top-0 z-10">
                <h1 className="text-lg font-bold">Constructor de Guiones</h1>
            </header>

            <div className="flex-1 p-6 flex flex-col pb-24 overflow-y-auto">
                {!script ? (
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon name="description" className="text-secondary" size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-text mb-2">Prepara tu Pitch</h2>
                            <p className="text-subtle text-sm px-4">Antes de simular, necesitas saber qué decir. Describe tu producto y generaremos un guión base.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-text mb-2 block">¿Qué estás vendiendo?</label>
                                <textarea 
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Ej: Software de contabilidad para PYMES que ahorra 10 horas al mes..." 
                                    className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className={`w-full h-12 bg-secondary text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 ${isGenerating ? 'opacity-70' : 'active:scale-95 transition-transform'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        <span>Escribiendo...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="auto_awesome" size={20} />
                                        <span>Generar Guión</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-fadeIn">
                        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex-1 overflow-y-auto">
                            <h3 className="font-bold text-text mb-4 flex items-center border-b pb-2 border-gray-100">
                                <Icon name="script" className="text-primary mr-2" size={20} />
                                Guión Sugerido
                            </h3>
                            <pre className="text-text text-sm whitespace-pre-wrap font-sans leading-relaxed text-left">
                                {script}
                            </pre>
                        </div>
                        <div className="mt-auto space-y-3">
                            <button onClick={() => setScript(null)} className="w-full h-12 bg-background text-subtle font-bold rounded-xl border border-gray-200">
                                Editar Datos
                            </button>
                            <Link to="/practice" className="block w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-transform">
                                <Icon name="mic" size={20} />
                                <span>Probar en Simulación</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Practice = () => {
    // States: idle -> connecting -> active (call) -> feedback
    const [state, setState] = useState<'idle' | 'connecting' | 'active' | 'feedback'>('idle');
    const [duration, setDuration] = useState(0);
    const [isAiTalking, setIsAiTalking] = useState(false);
    const timerRef = useRef<any>(null);

    // Call Simulation Effect
    useEffect(() => {
        if (state === 'active') {
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1);
                // Randomly toggle AI speaking visualizer
                if (Math.random() > 0.7) setIsAiTalking(prev => !prev);
            }, 1000);
            
            // Initial AI Greeting
            setTimeout(() => setIsAiTalking(true), 500);
            setTimeout(() => setIsAiTalking(false), 3500);
        } else {
            clearInterval(timerRef.current);
            if (state === 'idle') setDuration(0);
        }
        return () => clearInterval(timerRef.current);
    }, [state]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60).toString().padStart(2, '0');
        const secs = (s % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const startCall = () => {
        setState('connecting');
        setTimeout(() => setState('active'), 2000);
    };

    const endCall = () => {
        setState('feedback');
    };

    return (
        <div className="flex flex-col h-screen bg-secondary relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
            </div>

            {state === 'feedback' ? (
                <div className="flex flex-col h-full bg-background animate-fadeIn">
                    <header className="bg-surface p-4 border-b border-gray-100 text-center">
                        <h1 className="text-lg font-bold">Resultados de Simulación</h1>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6 pb-24">
                        <div className="bg-surface p-6 rounded-2xl shadow-sm text-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                <span className="text-3xl font-bold text-green-600">B+</span>
                            </div>
                            <h2 className="text-xl font-bold text-text">¡Buen intento!</h2>
                            <p className="text-subtle text-sm mt-1">Has sobrevivido a "Marta (Gatekeeper)"</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                                <h4 className="font-bold text-sm text-text flex items-center gap-2">
                                    <Icon name="check_circle" className="text-green-500" size={18}/> 
                                    Lo que hiciste bien
                                </h4>
                                <p className="text-xs text-subtle mt-1">Tu tono de voz fue calmado y profesional. Respondiste rápido a la objeción de precio.</p>
                            </div>
                            <div className="bg-surface p-4 rounded-xl border-l-4 border-orange-500 shadow-sm">
                                <h4 className="font-bold text-sm text-text flex items-center gap-2">
                                    <Icon name="warning" className="text-orange-500" size={18}/> 
                                    Áreas de mejora
                                </h4>
                                <p className="text-xs text-subtle mt-1">Interrumpiste a la IA dos veces. Recuerda hacer pausas activas para escuchar.</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button onClick={() => setState('idle')} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform">
                                Reintentar Escenario
                            </button>
                            <Link to="/scenarios" className="block w-full h-12 flex items-center justify-center text-text font-bold text-sm rounded-xl border border-gray-300">
                                Elegir otro escenario
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-between p-8 relative z-10 text-white">
                    
                    {/* Header */}
                    <div className="w-full flex justify-between items-start">
                        <Link to="/scenarios" className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                            <Icon name="arrow_back" className="text-white" />
                        </Link>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold opacity-70 bg-white/10 px-2 py-1 rounded">MODO SIMULACIÓN</span>
                            <span className="text-xs mt-1 opacity-50">Gemini Live Audio</span>
                        </div>
                    </div>

                    {/* Main Visual */}
                    <div className="flex flex-col items-center justify-center w-full mt-8">
                        {state === 'idle' ? (
                            <div className="text-center">
                                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-white/20">
                                    <Icon name="person" size={64} className="opacity-80" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Marta (Gatekeeper)</h2>
                                <p className="text-sm opacity-70 max-w-xs mx-auto mb-8">
                                    "Hola, soy Marta, recepcionista en Consultora Global. El Sr. Pérez está muy ocupado hoy..."
                                </p>
                                <button 
                                    onClick={startCall}
                                    className="w-full px-8 py-4 bg-green-500 text-white font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                                >
                                    <Icon name="call" /> Iniciar Llamada
                                </button>
                            </div>
                        ) : state === 'connecting' ? (
                            <div className="text-center animate-pulse">
                                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <Icon name="ring_volume" size={48} />
                                </div>
                                <h2 className="text-xl font-bold">Conectando...</h2>
                            </div>
                        ) : (
                            <div className="text-center w-full">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-mono font-bold tracking-widest">{formatTime(duration)}</h2>
                                    <p className="text-sm opacity-60 mt-2">En llamada con Marta</p>
                                </div>
                                
                                {/* Voice Visualizer */}
                                <div className="h-32 flex items-center justify-center gap-2 mb-12">
                                    {[1,2,3,4,5].map(i => (
                                        <div 
                                            key={i} 
                                            className={`w-3 bg-white rounded-full transition-all duration-300 ${isAiTalking ? 'animate-bounce h-16 opacity-100' : 'h-2 opacity-30'}`}
                                            style={{ animationDelay: `${i * 0.1}s` }}
                                        ></div>
                                    ))}
                                </div>

                                {/* Controls */}
                                <div className="grid grid-cols-3 gap-6 w-full max-w-xs mx-auto">
                                    <button className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                                        <Icon name="mic_off" size={28} />
                                    </button>
                                    <button 
                                        onClick={endCall}
                                        className="h-16 w-16 rounded-full bg-red-500 shadow-lg shadow-red-500/40 flex items-center justify-center active:scale-95 transition-transform"
                                    >
                                        <Icon name="call_end" size={32} />
                                    </button>
                                    <button className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                                        <Icon name="volume_up" size={28} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full text-center text-xs opacity-40 mt-auto">
                        SalesTrainer AI v1.0
                    </div>
                </div>
            )}
        </div>
    );
};

const Analysis = () => {
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="bg-surface p-4 border-b border-gray-100 text-center sticky top-0 z-10">
                <h1 className="text-lg font-bold">Progreso de Entrenamiento</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
                
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl shadow-sm border-l-4 border-primary">
                        <p className="text-xs text-subtle mb-1">Simulaciones</p>
                        <p className="text-2xl font-bold text-text">24</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl shadow-sm border-l-4 border-accent">
                        <p className="text-xs text-subtle mb-1">Nota Media</p>
                        <p className="text-2xl font-bold text-text">8.5/10</p>
                    </div>
                </div>

                {/* Weekly Chart */}
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-4">Constancia</h3>
                    <div className="h-40">
                        <WeeklyBarChart 
                            labels={['L', 'M', 'X', 'J', 'V', 'S', 'D']} 
                            data={[2, 4, 1, 5, 3, 0, 0]} 
                        />
                    </div>
                </div>

                {/* Badge/Achievement */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-2xl border border-orange-100 flex items-center gap-4">
                    <div className="text-4xl">🏆</div>
                    <div>
                        <h4 className="font-bold text-text text-sm">Próximo Logro: Negociador</h4>
                        <p className="text-xs text-subtle mt-1">Completa 3 escenarios de dificultad "Avanzado" para desbloquear.</p>
                    </div>
                </div>

                {/* AI Feedback List */}
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-3">Patrones Detectados</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1 bg-green-100 p-1 rounded-full h-fit"><Icon name="trending_up" size={14} className="text-green-600"/></div>
                            <div>
                                <p className="text-sm font-bold text-text">Mejora en Cierres</p>
                                <p className="text-xs text-subtle">Tus intentos de cierre han aumentado un 20% de efectividad esta semana.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-1 bg-red-100 p-1 rounded-full h-fit"><Icon name="speed" size={14} className="text-red-600"/></div>
                            <div>
                                <p className="text-sm font-bold text-text">Hablas muy rápido</p>
                                <p className="text-xs text-subtle">En el 40% de las llamadas, la IA detecta una velocidad superior a 150 palabras/min.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('sk-********************');
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="bg-surface p-4 border-b border-gray-100 flex items-center sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-4 text-text"><Icon name="arrow_back" /></button>
                <h1 className="text-lg font-bold">Ajustes</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
                
                {/* Profile */}
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                        JD
                    </div>
                    <div>
                        <h3 className="font-bold text-text">John Doe</h3>
                        <p className="text-xs text-subtle">Junior SDR • TechCorp</p>
                    </div>
                </div>

                {/* API Config */}
                <div className="bg-surface p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-text mb-2">Motor de IA</h3>
                    <p className="text-xs text-subtle mb-4">Configura tu Gemini API Key para habilitar las simulaciones de voz en tiempo real.</p>
                    
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-text">Gemini API Key</label>
                        <div className="relative">
                            <input 
                                type={showKey ? "text" : "password"} 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-background text-sm"
                            />
                            <button 
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-2.5 text-subtle"
                            >
                                <Icon name={showKey ? "visibility_off" : "visibility"} size={20} />
                            </button>
                        </div>
                        <button className="w-full py-2.5 bg-secondary text-white font-bold rounded-xl text-sm mt-2">Guardar Configuración</button>
                    </div>
                </div>

                <div className="bg-surface rounded-xl overflow-hidden border border-gray-100">
                    <button className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 border-b border-gray-100">
                        <span className="text-sm font-medium">Historial de Llamadas</span>
                        <Icon name="chevron_right" size={20} className="text-subtle" />
                    </button>
                    <button className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 border-b border-gray-100">
                        <span className="text-sm font-medium">Guía de Ventas</span>
                        <Icon name="chevron_right" size={20} className="text-subtle" />
                    </button>
                    <button className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 text-danger">
                        <span className="text-sm font-bold">Cerrar Sesión</span>
                        <Icon name="logout" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Objections = () => {
    // Reusing existing Objections component but keeping it if user wants to just study objections
    // Could be integrated into Scenarios details, but kept separate for quick reference.
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const categories = ['Todas', 'Precio', 'Tiempo', 'Competencia', 'Necesidad'];

    const filteredObjections = selectedCategory === 'Todas' 
        ? MOCK_OBJECTIONS 
        : MOCK_OBJECTIONS.filter(obj => obj.category === selectedCategory);

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="bg-surface p-4 border-b border-gray-100 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-center mb-4">Biblioteca de Objeciones</h1>
                <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                selectedCategory === cat ? 'bg-secondary text-white' : 'bg-background text-subtle border border-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
                {filteredObjections.map(obj => (
                    <div key={obj.id} className="bg-surface p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Icon name={obj.icon} />
                            </div>
                            <div>
                                <h3 className="font-bold text-text">"{obj.title}"</h3>
                                <span className="text-[10px] font-bold text-subtle bg-gray-100 px-2 py-0.5 rounded">{obj.category}</span>
                            </div>
                        </div>
                        <div className="bg-background p-3 rounded-lg text-sm text-text border border-gray-100">
                            {obj.response}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- APP COMPONENT ---

const App = () => {
    return (
        <HashRouter>
            <div className="font-sans antialiased text-text bg-background min-h-screen max-w-md mx-auto relative shadow-2xl overflow-hidden">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/scenarios" element={<Scenarios />} />
                    <Route path="/create" element={<CreateScript />} />
                    <Route path="/practice" element={<Practice />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/objections" element={<Objections />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
                <BottomNav />
            </div>
        </HashRouter>
    );
};

export default App;