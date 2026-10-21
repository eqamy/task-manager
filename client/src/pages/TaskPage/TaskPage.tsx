import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Trash2, Filter } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { tasksApi } from '@client/src/api';
import type { Task, TaskPriority } from '@shared/api.interface';

const priorityLabels: Record<TaskPriority, string> = {
  '高': '高',
  '中': '中',
  '低': '低',
};

const priorityColors: Record<TaskPriority, string> = {
  '高': 'bg-red-100 text-red-700 border-red-200',
  '中': 'bg-amber-100 text-amber-700 border-amber-200',
  '低': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const filterOptions: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '高', label: '高优先级' },
  { value: '中', label: '中优先级' },
  { value: '低', label: '低优先级' },
];

const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('中');
  const [filter, setFilter] = useState<TaskPriority | 'all'>('all');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.getTasks(filter === 'all' ? undefined : filter);
      setTasks(data);
    } catch (error) {
      logger.error('获取任务列表失败', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newTask = await tasksApi.createTask({ title: title.trim(), priority });
      setTasks((prev) => [newTask, ...prev]);
      setTitle('');
      setPriority('中');
    } catch (error) {
      logger.error('创建任务失败', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await tasksApi.toggleTask(id);
      setTasks((prev) => prev.map((t: Task) => (t.id === id ? updated : t)));
    } catch (error) {
      logger.error('切换任务状态失败', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks((prev) => prev.filter((t: Task) => t.id !== id));
    } catch (error) {
      logger.error('删除任务失败', error);
    }
  };

  const completedCount = tasks.filter((t: Task) => t.isCompleted).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            智能任务管理
          </h1>
          <p className="text-slate-500">
            高效管理你的日常任务，专注重要事项
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入新任务..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="高">高优先级</option>
              <option value="中">中优先级</option>
              <option value="低">低优先级</option>
            </select>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[100px]"
            >
              <Plus size={18} />
              添加
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Filter size={16} />
            <span>筛选：</span>
            <div className="flex gap-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-slate-500">
            共 {tasks.length} 项，已完成 {completedCount} 项
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">加载中...</div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
              <div className="text-slate-400 mb-2">
                {filter === 'all' ? '暂无任务' : '该优先级暂无任务'}
              </div>
              <div className="text-sm text-slate-300">
                在上方输入框添加你的第一个任务吧
              </div>
            </div>
          ) : (
            tasks.map((task: Task) => (
              <div
                key={task.id}
                className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 transition-all hover:shadow-sm ${
                  task.isCompleted ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => handleToggle(task.id)}
                  aria-label={task.isCompleted ? '标记为未完成' : '标记为已完成'}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 hover:border-blue-500'
                  }`}
                >
                  {task.isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-slate-800 font-medium break-words ${
                      task.isCompleted ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${priorityColors[task.priority]}`}
                >
                  {priorityLabels[task.priority]}优先级
                </span>

                <button
                  onClick={() => handleDelete(task.id)}
                  aria-label="删除任务"
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
