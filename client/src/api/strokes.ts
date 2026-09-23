import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  StrokeItem,
  StrokeListResponse,
} from '@shared/api.interface';

export async function getStrokes(
  projectId: string,
  cursor?: string,
  limit = 50,
): Promise<StrokeListResponse> {
  const { data } = await axiosForBackend.get(`/api/strokes/${projectId}`, {
    params: { cursor, limit },
  });
  return data;
}

export async function createStroke(payload: {
  projectId: string;
  strokeData: StrokeItem['strokeData'];
}): Promise<StrokeItem> {
  const { data } = await axiosForBackend.post('/api/strokes', payload);
  return data;
}

export async function deleteStroke(id: string, isAdmin = false): Promise<void> {
  await axiosForBackend.delete(`/api/strokes/${id}`, {
    params: { isAdmin },
  });
}
