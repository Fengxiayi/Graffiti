import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { http } from '../lib/http';
import type { UserInfo } from '../../shared/api.interface';

export const TOKEN_KEY = 'graffiti_token';
export const UNAUTHORIZED_EVENT = 'graffiti_unauthorized';

export interface AuthContextValue {
  user: UserInfo | null;
  isLogin: boolean;
  loading: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const login = useCallback((token: string, userInfo: UserInfo) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userInfo);
  }, []);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await http.get<UserInfo>('/api/auth/me');
      setUser(res.data);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearAuth();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [clearAuth]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLogin: !!user,
      loading,
      login,
      logout,
      refresh,
    }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export { axios };
