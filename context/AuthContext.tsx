import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

interface UserStats {
  totalPitches: number;
  totalPractices: number;
  totalLeads: number;
  averageScore: number;
  streak?: number;
  lastPracticeDate?: string;
}

interface UserNotifications {
  email?: boolean;
  push?: boolean;
  weeklySummary?: boolean;
  aiFeedback?: boolean;
  practiceReminders?: boolean;
  practiceFrequency?: 'daily' | 'weekly';
  achievements?: boolean;
  defaultReminderMinutes?: number;
}

interface UserPreferences {
  notifications?: UserNotifications;
  language?: string;
  theme?: 'light' | 'dark';
}

interface UserSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  company?: string;
  role: string;
  avatar?: string;
  stats?: UserStats;
  preferences?: UserPreferences;
  subscription?: UserSubscription;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada al iniciar
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Opcional: Validar token con el backend aquí
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};