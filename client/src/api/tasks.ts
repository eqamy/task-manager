import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { CreateTaskRequest, Task, TaskListResponse, TaskPriority } from '@shared/api.interface';

export async function getTasks(priority?: TaskPriority): Promise<Task[]> {
  const url = priority ? `/api/tasks?priority=${priority}` : '/api/tasks';
  const response = await axiosForBackend.get<TaskListResponse>(url);
  return response.data.items;
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const response = await axiosForBackend.post<Task>('/api/tasks', data);
  return response.data;
}

export async function toggleTask(id: string): Promise<Task> {
  const response = await axiosForBackend.patch<Task>(`/api/tasks/${id}/toggle`);
  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await axiosForBackend.delete(`/api/tasks/${id}`);
}
