import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'leads', icon: 'group', label: 'Leads', path: '/leads' },
        { id: 'web-analysis', icon: 'add_circle', label: 'Nuevo Pitch', path: '/web-analysis' },
        { id: 'objections', icon: 'list', label: 'Objeciones', path: '/objections' },
        { id: 'practice', icon: 'mic', label: 'Práctica', path: '/practice' },
        { id: 'analysis', icon: 'emoji_events', label: 'Progreso', path: '/analysis' },
        { id: 'settings', icon: 'settings', label: 'Ajustes', path: '/settings' },
    ];

    if (location.pathname === '/' || location.pathname === '/login') return null;

    return (
        <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-gray-100 h-screen sticky top-0 shrink-0">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <Icon name="school" size={20} />
                </div>
                <h1 className="text-xl font-bold text-text">PerfectCall</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                {tabs.map((tab) => {
                    const isActive = location.pathname.startsWith(tab.path);
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                                isActive 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-subtle hover:bg-background'
                            }`}
                        >
                            <Icon name={tab.icon} size={20} filled={isActive} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                        JD
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-text truncate">John Doe</p>
                        <p className="text-xs text-subtle truncate">Junior SDR</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};