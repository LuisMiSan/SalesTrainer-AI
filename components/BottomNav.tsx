import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Matching the Screenshot bottom nav structure
    // Inicio, Crear, Historial, Perfil
    const tabs = [
        { id: 'home', icon: 'home', label: 'Inicio', path: '/dashboard' },
        { id: 'create', icon: 'add_box', label: 'Crear', path: '/web-analysis' },
        { id: 'history', icon: 'history', label: 'Historial', path: '/web-history' },
        { id: 'profile', icon: 'person', label: 'Perfil', path: '/profile' },
    ];

    if (location.pathname === '/' || location.pathname === '/login') return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {tabs.map((tab) => {
                    // Check active state more strictly for profile
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