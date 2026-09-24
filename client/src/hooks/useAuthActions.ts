import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/** 兼容原平台 useAuthActions 的本地实现：isLogin / goLogin / logout */
export function useAuthActions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return {
    isLogin: !!user,
    goLogin: () => navigate('/login'),
    logout,
  };
}
