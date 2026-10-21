export type TaskPriority = '高' | '中' | '低';

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskListResponse {
  items: Task[];
}

export interface CreateTaskRequest {
  title: string;
  priority: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  priority?: TaskPriority;
  isCompleted?: boolean;
}
