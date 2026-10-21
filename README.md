# 智能任务管理系统

一个基于 Node.js + Supabase 的智能任务管理应用，中文界面，支持任务的添加、优先级管理、完成状态切换与筛选。

## 功能特性

- **添加任务**：输入标题 + 选择优先级（高 / 中 / 低）即可创建
- **任务列表**：展示标题、优先级、完成状态，按创建时间倒序排列
- **完成/未完成切换**：一键切换任务状态，已完成任务显示删除线并降低透明度
- **删除任务**：每条任务支持单独删除
- **优先级筛选**：全部 / 高 / 中 / 低 四档快速筛选
- **统计信息**：顶部展示任务总数与已完成数量

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React + Vite + Tailwind CSS |
| 后端 | NestJS（Node.js） |
| 数据库 | Supabase（PostgreSQL），通过 `@supabase/supabase-js` 访问 |

## 快速开始

### 1. 准备 Supabase 数据库

在 Supabase 控制台创建项目后，进入 SQL Editor 执行：

```sql
drop table if exists public.tasks;

create table public.tasks (
  id bigint generated always as identity primary key,
  title text not null,
  priority text not null default '中' check (priority in ('高','中','低')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "允许匿名读取任务" on public.tasks for select using (true);
create policy "允许匿名添加任务" on public.tasks for insert with check (true);
create policy "允许匿名更新任务" on public.tasks for update using (true) with check (true);
create policy "允许匿名删除任务" on public.tasks for delete using (true);
```

### 2. 配置连接信息

修改 `server/modules/task/task.service.ts` 中的：

```ts
const SUPABASE_URL = 'https://<your-project>.supabase.co';
const SUPABASE_KEY = '<your anon/publishable key>';
```

建议改为读取环境变量（如 `process.env.SUPABASE_URL` / `process.env.SUPABASE_KEY`）。

### 3. 安装依赖并启动

```bash
npm install
npm run dev
```

## 项目结构

```
├── client/    # 前端 React 代码
├── server/    # 后端 NestJS 代码（含 @supabase/supabase-js 数据访问）
├── shared/    # 前后端共享类型
└── package.json
```
