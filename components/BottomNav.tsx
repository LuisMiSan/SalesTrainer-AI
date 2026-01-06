import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'dashboard', icon: 'school', label: 'Dojo', path: '/dashboard' },
        { id: 'scenarios', icon: 'theater_comedy', label: 'Escenarios', path: '/scenarios' },
        { id: 'create', icon: 'edit_note', label: 'Guiones', path: '/create' },
        { id: 'practice', icon: 'call', label: 'Simular', path: '/practice' },
        { id: 'analysis', icon: 'insights', label: 'Progreso', path: '/analysis' },
    ];

    if (location.pathname === '/' || location.pathname === '/login') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = location.pathname.startsWith(tab.path);
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                                isActive ? 'text-primary' : 'text-subtle'
                            }`}
                        >
                            <Icon 
                                name={tab.icon} 
                                filled={isActive} 
                                className={isActive ? 'text-primary' : 'text-subtle'}
                            />
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};