import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import type { Task, TaskPriority } from '@shared/api.interface';

const SUPABASE_URL = 'https://wqpujpzlbgsfmlwxzcmj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lvaPtAFFfI_o24D3NIUp1Q_2TvipRwF';

interface SupabaseTask {
  id: string | number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

@Injectable()
export class TaskService {
  private readonly supabase;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  private mapTask(row: SupabaseTask): Task {
    return {
      id: String(row.id),
      title: row.title,
      priority: row.priority as TaskPriority,
      isCompleted: row.completed,
      createdAt: row.created_at,
    };
  }

  private parseId(id: string): string | number {
    const numeric = Number(id);
    if (!Number.isNaN(numeric) && String(numeric) === id) {
      return numeric;
    }
    return id;
  }

  async getTasks(priority?: TaskPriority): Promise<Task[]> {
    let query = this.supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Supabase GET failed: ${error.message}`);
    }
    const rows = (data ?? []) as SupabaseTask[];
    return rows.map((row) => this.mapTask(row));
  }

  async createTask(title: string, priority: TaskPriority): Promise<Task> {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({ title, priority })
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase POST failed: ${error.message}`);
    }
    return this.mapTask(data as SupabaseTask);
  }

  async toggleCompleted(id: string): Promise<Task> {
    const targetId = this.parseId(id);

    const { data: existing, error: getError } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (getError) {
      throw new Error(`Supabase GET by id failed: ${getError.message}`);
    }
    if (!existing) {
      throw new NotFoundException('任务不存在');
    }

    const newCompleted = !(existing as SupabaseTask).completed;

    const { data, error: updateError } = await this.supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', targetId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Supabase PATCH failed: ${updateError.message}`);
    }
    return this.mapTask(data as SupabaseTask);
  }

  async deleteTask(id: string): Promise<void> {
    const targetId = this.parseId(id);

    const { data, error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', targetId)
      .select();

    if (error) {
      throw new Error(`Supabase DELETE failed: ${error.message}`);
    }
    if (!data || data.length === 0) {
      throw new NotFoundException('任务不存在');
    }
  }
}
