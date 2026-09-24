import { http } from '../lib/http';
import type { FeedbackItem } from '@shared/api.interface';

export async function createFeedback(payload: {
  content: string;
  contact?: string;
}): Promise<FeedbackItem> {
  const { data } = await http.post('/api/feedback', payload);
  return data;
}
