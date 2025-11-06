import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_BASE } from './config';
import type { User } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  hydrated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('auth_user');
        if (raw) {
          const u = JSON.parse(raw) as User;
          setUser(u);
        }
      } catch (e) {
        // ignore
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const url = `${API_BASE}/user?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const arr = (await res.json()) as User[];
    if (!arr || arr.length === 0) throw new Error('Sai tài khoản hoặc mật khẩu');
    setUser(arr[0]);
    try { await AsyncStorage.setItem('auth_user', JSON.stringify(arr[0])); } catch {}
    return arr[0];
  };

  const logout = () => { setUser(null); AsyncStorage.removeItem('auth_user').catch(() => {}); };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
