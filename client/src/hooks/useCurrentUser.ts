import type { UserInfo } from '@shared/api.interface';
import { useAuth } from '../auth/AuthContext';

interface CurrentUserResult {
  user: UserInfo | null;
  loading: boolean;
}

export function useCurrentUser(): CurrentUserResult {
  const { user, loading } = useAuth();
  return { user, loading };
}
