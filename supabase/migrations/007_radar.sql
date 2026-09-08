-- 竞品雷达 - 项目管理 + 竞品追踪 + 行业文档

create table if not exists radar_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  color text default '#f59e0b',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references radar_projects(id) on delete cascade,
  name text not null,
  url text default '',
  description text default '',
  features_json jsonb default '{}',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists research_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references radar_projects(id) on delete cascade,
  title text not null default '未命名笔记',
  content text default '',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table radar_projects enable row level security;
alter table competitors enable row level security;
alter table research_notes enable row level security;

create policy "public_access" on radar_projects for all using (true);
create policy "public_access" on competitors for all using (true);
create policy "public_access" on research_notes for all using (true);
