import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import type { UserInfo } from '../../../shared/api.interface';

export interface UseAuthActions {
  isLogin: boolean;
  user: UserInfo | null;
  goLogin: () => void;
  logout: () => void;
}

/** 兼容旧页面的登录态操作封装 */
export function useAuthActions(): UseAuthActions {
  const { isLogin, user, logout } = useAuth();
  const navigate = useNavigate();

  const goLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return { isLogin, user, goLogin, logout };
}
