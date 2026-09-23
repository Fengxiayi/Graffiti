import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { GalleryItem, GalleryListResponse } from '@shared/api.interface';

export async function getGallery(
  page = 1,
  pageSize = 12,
): Promise<GalleryListResponse> {
  const { data } = await axiosForBackend.get('/api/gallery', {
    params: { page, pageSize },
  });
  return data;
}

export async function getMyGalleryItems(): Promise<{ items: GalleryItem[] }> {
  const { data } = await axiosForBackend.get('/api/gallery/mine');
  return data;
}

export async function getGalleryItem(id: string): Promise<GalleryItem> {
  const { data } = await axiosForBackend.get(`/api/gallery/${id}`);
  return data;
}

export async function createGalleryItem(payload: {
  title: string;
  imageUrl: string;
  projectId?: string;
}): Promise<GalleryItem> {
  const { data } = await axiosForBackend.post('/api/gallery', payload);
  return data;
}

export async function toggleGalleryLike(id: string): Promise<{
  liked: boolean;
  likeCount: number;
}> {
  const { data } = await axiosForBackend.post(`/api/gallery/${id}/like`);
  return data;
}

export async function getGalleryComments(galleryId: string): Promise<{
  items: Array<{
    id: string;
    galleryId: string;
    content: string;
    replyTo: string | null;
    creatorId: string;
    createdAt: string;
  }>;
  total: number;
}> {
  const { data } = await axiosForBackend.get(`/api/gallery/${galleryId}/comments`);
  return data;
}

export async function createGalleryComment(payload: {
  galleryId: string;
  content: string;
  replyTo?: string;
}): Promise<{
  id: string;
  galleryId: string;
  content: string;
  replyTo: string | null;
  creatorId: string;
  createdAt: string;
}> {
  const { data } = await axiosForBackend.post('/api/gallery/comments', payload);
  return data;
}

export async function deleteGalleryComment(id: string): Promise<void> {
  await axiosForBackend.delete(`/api/gallery/comments/${id}`);
}
