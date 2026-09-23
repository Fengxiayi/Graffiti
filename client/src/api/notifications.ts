import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { NotificationListResponse } from '@shared/api.interface';

export async function getNotifications(): Promise<NotificationListResponse> {
  const { data } = await axiosForBackend.get('/api/notifications');
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await axiosForBackend.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await axiosForBackend.post('/api/notifications/read-all');
}
