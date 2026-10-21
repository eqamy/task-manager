# 智能任务管理系统

一个基于 Node.js + Supabase 的智能任务管理应用，中文界面，支持任务的添加、优先级管理、完成状态切换与筛选。可部署到 Vercel（全栈 Serverless 模式）。

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
| 部署 | Vercel（Serverless 函数托管前后端） |

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

`server/modules/task/task.service.ts` 从环境变量读取 Supabase 配置（未配置时回退到代码内的默认值）：

| 环境变量 | 说明 |
| --- | --- |
| `SUPABASE_URL` | Supabase 项目 URL，如 `https://<your-project>.supabase.co` |
| `SUPABASE_ANON_KEY` | anon / publishable key（`sb_publishable_...`） |

### 3. 本地运行

```bash
npm install
npm run dev
```

## 部署到 Vercel（全栈 Serverless）

本项目采用"整个 NestJS 应用作为一个 Serverless 函数"的部署方式：`api/index.ts` 以懒加载单例启动 NestJS，同时处理 `/api/*` 接口和前端页面/静态资源（前端请求均为同源相对路径，无需改动前端）。

1. 把仓库推到 GitHub（如 `eqamy/task-manager`）
2. 在 Vercel 导入该仓库，**Framework Preset 选择 Other**（构建命令由根目录 `vercel.json` 指定为 `npm run build:prod`）
3. 在 Project Settings → Environment Variables 添加：
   - `SUPABASE_URL` = `https://wqpujpzlbgsfmlwxzcmj.supabase.co`
   - `SUPABASE_ANON_KEY` = `sb_publishable_你的key`
4. 点击 Deploy 部署

> 说明：`vercel.json` 中通过 `rewrites` 将全部请求指向 `/api/index`；构建时 `npm run build:prod` 会先后构建 NestJS 服务端（输出到 `dist/server`）和 Vite 前端（输出到 `dist/client`），Serverless 入口从 `dist/server` 动态加载应用并托管 `dist/client` 静态资源。

## 项目结构

```
├── api/        # Vercel Serverless 入口（引导 NestJS 应用）
├── client/     # 前端 React 代码
├── server/     # 后端 NestJS 代码（含 @supabase/supabase-js 数据访问）
├── shared/     # 前后端共享类型
└── package.json
```
