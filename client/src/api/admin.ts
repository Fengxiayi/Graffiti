import { http } from '../lib/http';
import type { GalleryListResponse, ProjectItem, FeedbackItem } from '@shared/api.interface';

export async function adminListProjects(
  page = 1,
  pageSize = 12,
): Promise<{ items: ProjectItem[]; total: number }> {
  const { data } = await http.get('/api/admin/projects', {
    params: { page, pageSize },
  });
  return data;
}

export async function adminSetProjectHidden(
  id: string,
  isHidden: boolean,
): Promise<void> {
  await http.patch(`/api/admin/projects/${id}/hidden`, { isHidden });
}

export async function adminSetProjectPinned(
  id: string,
  isPinned: boolean,
): Promise<void> {
  await http.patch(`/api/admin/projects/${id}/pinned`, { isPinned });
}

export async function adminDeleteProject(id: string): Promise<void> {
  await http.delete(`/api/admin/projects/${id}`);
}

export async function adminListGallery(
  page = 1,
  pageSize = 12,
): Promise<GalleryListResponse> {
  const { data } = await http.get('/api/admin/gallery', {
    params: { page, pageSize },
  });
  return data;
}

export async function adminSetGalleryPinned(
  id: string,
  isPinned: boolean,
): Promise<void> {
  await http.patch(`/api/admin/gallery/${id}/pinned`, { isPinned });
}

export async function adminDeleteGalleryItem(id: string): Promise<void> {
  await http.delete(`/api/admin/gallery/${id}`);
}

export async function adminDeleteGalleryComment(id: string): Promise<void> {
  await http.delete(`/api/admin/gallery/comments/${id}`);
}

export async function adminListFeedbacks(
  page = 1,
  pageSize = 12,
): Promise<{ items: FeedbackItem[]; total: number }> {
  const { data } = await http.get('/api/admin/feedbacks', {
    params: { page, pageSize },
  });
  return data;
}

export async function adminUpdateFeedbackStatus(
  id: string,
  status: string,
): Promise<void> {
  await http.patch(`/api/admin/feedbacks/${id}/status`, { status });
}
