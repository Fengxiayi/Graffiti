import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { FeedbackItem } from '@shared/api.interface';

export async function createFeedback(payload: {
  content: string;
  contact?: string;
}): Promise<FeedbackItem> {
  const { data } = await axiosForBackend.post('/api/feedback', payload);
  return data;
}
