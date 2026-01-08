import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Matching the HTML bottom nav structure
    const tabs = [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'leads', icon: 'group', label: 'Leads', path: '/leads' },
        { id: 'analysis', icon: 'add_circle', label: 'Nuevo Pitch', path: '/web-analysis', highlight: true },
        { id: 'objections', icon: 'list', label: 'Objeciones', path: '/objections' },
        { id: 'practice', icon: 'mic', label: 'Práctica', path: '/practice' },
    ];

    if (location.pathname === '/' || location.pathname === '/login') return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-100 pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {tabs.map((tab) => {
                    const isActive = location.pathname.startsWith(tab.path);
                    
                    if (tab.highlight) {
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className="flex flex-col items-center justify-center -mt-6"
                            >
                                <div className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${isActive ? 'bg-secondary' : 'bg-primary'} text-white transition-colors`}>
                                    <Icon name={tab.icon} size={30} />
                                </div>
                                <span className="text-[10px] font-medium mt-1 text-subtle">{tab.label}</span>
                            </button>
                        );
                    }

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