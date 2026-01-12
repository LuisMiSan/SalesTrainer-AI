import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Matching the Sidebar structure
    const tabs = [
        { id: 'home', icon: 'home', label: 'Inicio', path: '/dashboard' },
        { id: 'leads', icon: 'groups', label: 'Leads', path: '/leads' },
        { id: 'create', icon: 'add_box', label: 'Crear', path: '/web-analysis' },
        { id: 'analysis', icon: 'monitoring', label: 'Progreso', path: '/analysis' },
    ];

    if (location.pathname === '/' || location.pathname === '/login') return null;

    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-t border-primary/10 dark:border-primary/20 pb-safe z-50">
            <nav className="flex justify-around items-center h-16 px-2">
                {tabs.map((tab) => {
                    const isActive = location.pathname.startsWith(tab.path);
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-end gap-1 w-full h-full ${
                                isActive 
                                    ? 'text-primary' 
                                    : 'text-subtle-light dark:text-subtle-dark'
                            }`}
                        >
                            <span 
                                className="material-symbols-outlined text-2xl"
                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {tab.icon}
                            </span>
                            <p className="text-xs font-medium">{tab.label}</p>
                        </button>
                    );
                })}
            </nav>
        </footer>
    );
};