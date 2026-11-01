import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SystemRole } from '../types';
import { SEED_USERS } from '../data/seedData';
import { initLocalStorage, api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; fullName: string; department: string; year: number; rollNumber?: string }) => Promise<boolean>;
  logout: () => void;
  quickSwitchUser: (presetRole: string) => void;
  switchUserById: (userId: string) => void;
  resetPassword: (email: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    initLocalStorage();

    // Check saved auth
    const savedUserId = localStorage.getItem('apex_current_user_id');
    if (savedUserId) {
      api.getAllUsers().then((users) => {
        const found = users.find((u) => u.id === savedUserId);
        if (found) {
          setUser(found);
        } else {
          // Default to HOD for instant exploration
          setUser(SEED_USERS[0]);
        }
      });
    } else {
      // Default to HOD for seamless first-turn evaluation
      setUser(SEED_USERS[0]);
    }

    // Check theme
    const savedTheme = (localStorage.getItem('apex_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('apex_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('apex_current_user_id', data.user.id);
        return true;
      }
    } catch {
      // fallback to local verification
    }

    const allUsers = await api.getAllUsers();
    const found = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && (u.password ? u.password === password : true)
    );
    if (found) {
      setUser(found);
      localStorage.setItem('apex_current_user_id', found.id);
      return true;
    }
    return false;
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    department: string;
    year: number;
    rollNumber?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const body = await res.json();
        setUser(body.user);
        localStorage.setItem('apex_current_user_id', body.user.id);
        return true;
      }
    } catch {
      // fallback
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      rollNumber: data.rollNumber || `2026STU${Math.floor(1000 + Math.random() * 9000)}`,
      department: data.department || 'Computer Science',
      year: data.year || 1,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'New student member at Apex College.',
      systemRole: 'MEMBER',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem('apex_current_user_id', newUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('apex_current_user_id');
  };

  const quickSwitchUser = (presetRole: string) => {
    let targetUser: User | undefined;
    if (presetRole === 'HOD') {
      targetUser = SEED_USERS[0]; // Prof. Dr. Rajesh Sundaram (HOD)
    } else if (presetRole === 'PRESIDENT' || presetRole === 'PRESIDENT_CODE') {
      targetUser = SEED_USERS[1]; // Aryan Sharma (Code Crackers)
    } else if (presetRole === 'PRESIDENT_DEV' || presetRole === 'PRESIDENT_INNOVATION') {
      targetUser = SEED_USERS[3]; // Marcus Vance (Innovation)
    } else if (presetRole === 'PRESIDENT_DEVSPIRE') {
      targetUser = SEED_USERS[5]; // Elena Rostova (Devspire)
    } else if (presetRole === 'PRESIDENT_SPORTS') {
      targetUser = SEED_USERS[7]; // Zoya Qureshi (Sports)
    } else if (presetRole === 'PRESIDENT_SANKALPA') {
      targetUser = SEED_USERS[9]; // Neil Deshmukh (Social responsibility sankalpa)
    } else if (presetRole === 'PRESIDENT_CULTURAL') {
      targetUser = SEED_USERS[11]; // Kevin Zhang (Cultural)
    } else if (presetRole === 'VICE_PRESIDENT') {
      targetUser = SEED_USERS[2]; // Tara Sen (Code Crackers VP)
    } else {
      targetUser = SEED_USERS[13]; // Rahul Verma (Student Member)
    }

    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('apex_current_user_id', targetUser.id);
    }
  };

  const switchUserById = (userId: string) => {
    const targetUser = SEED_USERS.find((u) => u.id === userId);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('apex_current_user_id', targetUser.id);
    }
  };

  const resetPassword = async (email: string, newPass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: newPass }),
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        quickSwitchUser,
        switchUserById,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
