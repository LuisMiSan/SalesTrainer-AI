import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

interface WelcomeCardProps {
    userName: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4 flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative image placeholder */}
        <div className="w-24 h-24 bg-orange-50 rounded-full mb-4 flex items-center justify-center">
             <img 
                src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png" 
                alt="Plant" 
                className="w-16 h-16 object-contain opacity-80"
            />
        </div>
        <h2 className="text-xl font-bold text-gray-900">¡Hola de nuevo, {userName.split(' ')[0]}!</h2>
        <p className="text-subtle text-sm mt-1">Listo para pulir tus habilidades hoy?</p>
    </div>
);

interface StreakCardProps {
    days: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ days }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4 text-center">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Racha de Práctica</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-green-500">{days}</span>
            <span className="text-4xl">🔥</span>
        </div>
        <p className="text-xl font-bold text-gray-900 mb-2">Días Seguidos</p>
        <p className="text-xs text-subtle px-4">¡Increíble! Sigue así para convertirte en un maestro.</p>
    </div>
);

export const QuickActionsGrid: React.FC = () => {
    const navigate = useNavigate();
    
    const actions = [
        { label: 'Iniciar Análisis', icon: 'travel_explore', path: '/web-analysis', color: 'bg-primary text-white', iconColor: 'text-white' },
        { label: 'Leads Activos', icon: 'groups', path: '/leads', color: 'bg-white text-gray-900 border border-gray-100', iconColor: 'text-primary' },
        { label: 'Pitches Pendientes', icon: 'assignment', path: '/web-history', color: 'bg-white text-gray-900 border border-gray-100', iconColor: 'text-primary' },
        { label: 'Práctica Diaria', icon: 'mic', path: '/practice', color: 'bg-white text-gray-900 border border-gray-100', iconColor: 'text-green-500' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 mb-4">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-2 h-32 active:scale-95 transition-transform`}
                >
                    <div className={action.iconColor}>
                        <Icon name={action.icon} size={32} />
                    </div>
                    <span className="text-sm font-bold leading-tight">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

interface SkillBarProps {
    label: string;
    value: number;
    color: string;
}

const SkillBar: React.FC<SkillBarProps> = ({ label, value, color }) => (
    <div className="mb-4 last:mb-0">
        <div className="flex justify-between mb-1">
            <span className="text-sm font-bold text-gray-700">{label}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden relative">
             {/* Background bar */}
             <div 
                className={`h-full ${color} transition-all duration-1000 ease-out`}
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);

interface SkillProgressCardProps {
    confidence: number;
    clarity: number;
    empathy: number;
}

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ confidence, clarity, empathy }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Progreso Semanal</h3>
            <span className="text-xs text-primary font-bold cursor-pointer">Detalles</span>
        </div>
        <SkillBar label="Confianza" value={confidence} color="bg-green-400" />
        <SkillBar label="Claridad" value={clarity} color="bg-blue-400" />
        <SkillBar label="Empatía" value={empathy} color="bg-green-400" />
    </div>
);