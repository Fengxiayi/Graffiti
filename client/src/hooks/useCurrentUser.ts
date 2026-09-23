import { useState, useEffect } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

interface CurrentUser {
  userId: string;
  userName?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const res = await axiosForBackend.get('/api/user/me');
        if (mounted && res.data?.userId) {
          setUser(res.data);
        }
      } catch (err) {
        logger.debug('Get current user failed, possibly not logged in');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}
