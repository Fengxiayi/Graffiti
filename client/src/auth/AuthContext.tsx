import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import type {
  UserInfo,
  RegisterRequest,
  LoginRequest,
} from '@shared/api.interface';
import { http, TOKEN_KEY, UNAUTHORIZED_EVENT } from '../lib/http';

interface AuthContextValue {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<UserInfo>;
  register: (payload: RegisterRequest) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  // 应用启动：若本地有 token，则拉取用户信息
  useEffect(() => {
    let mounted = true;
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const { data } = await http.get<UserInfo>('/api/auth/me');
        if (mounted) setUser(data);
      } catch {
        clearAuth();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchMe();

    return () => {
      mounted = false;
    };
  }, [clearAuth]);

  // 401 时同步清理登录态
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const payload: LoginRequest = { username, password };
    const { data } = await http.post<{
      token: string;
      user: UserInfo;
    }>('/api/auth/login', payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const { data } = await http.post<{
      token: string;
      user: UserInfo;
    }>('/api/auth/register', payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 必须在 <AuthProvider> 内使用');
  }
  return ctx;
}
