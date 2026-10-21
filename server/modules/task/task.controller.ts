import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { TaskService } from './task.service';
import type { Task, TaskListResponse, TaskPriority } from '@shared/api.interface';

class CreateTaskDto {
  @IsString()
  title!: string;

  @IsString()
  @IsIn(['高', '中', '低'])
  priority!: '高' | '中' | '低';
}

@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(@Query('priority') priority?: string): Promise<TaskListResponse> {
    const validPriorities: TaskPriority[] = ['高', '中', '低'];
    const validPriority = priority && validPriorities.includes(priority as TaskPriority)
      ? (priority as TaskPriority)
      : undefined;
    const items: Task[] = await this.taskService.getTasks(validPriority);
    return { items };
  }

  @Post()
  async createTask(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.taskService.createTask(dto.title, dto.priority);
  }

  @Patch(':id/toggle')
  async toggleTask(@Param('id') id: string): Promise<Task> {
    return this.taskService.toggleCompleted(id);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.taskService.deleteTask(id);
    return { success: true };
  }
}
