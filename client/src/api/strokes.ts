import { http } from '../lib/http';
import type {
  StrokeItem,
  StrokeListResponse,
} from '@shared/api.interface';

export async function getStrokes(
  projectId: string,
  cursor?: string,
  limit = 50,
): Promise<StrokeListResponse> {
  const { data } = await http.get(`/api/strokes/${projectId}`, {
    params: { cursor, limit },
  });
  return data;
}

export async function createStroke(payload: {
  projectId: string;
  strokeData: StrokeItem['strokeData'];
}): Promise<StrokeItem> {
  const { data } = await http.post('/api/strokes', payload);
  return data;
}

export async function deleteStroke(id: string): Promise<void> {
  // 删除权限由服务端按 JWT 角色判定（管理员可删任意笔迹）
  await http.delete(`/api/strokes/${id}`);
}
