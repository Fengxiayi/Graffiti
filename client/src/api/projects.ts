import { http } from '../lib/http';
import type {
  ProjectItem,
  ProjectListResponse,
} from '@shared/api.interface';

export async function getProjects(
  page = 1,
  pageSize = 12,
): Promise<ProjectListResponse> {
  const { data } = await http.get('/api/projects', {
    params: { page, pageSize },
  });
  return data;
}

export async function getProjectById(id: string): Promise<ProjectItem> {
  const { data } = await http.get(`/api/projects/${id}`);
  return data;
}

export async function getMyProjects(): Promise<{
  created: ProjectItem[];
  joined: ProjectItem[];
}> {
  const { data } = await http.get('/api/projects/mine');
  return data;
}

export async function createProject(payload: {
  name: string;
  description?: string;
}): Promise<ProjectItem> {
  const { data } = await http.post('/api/projects', payload);
  return data;
}
