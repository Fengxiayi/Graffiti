import { http } from '../lib/http';
import type { NotificationListResponse } from '@shared/api.interface';

export async function getNotifications(): Promise<NotificationListResponse> {
  const { data } = await http.get('/api/notifications');
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await http.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await http.post('/api/notifications/read-all');
}
