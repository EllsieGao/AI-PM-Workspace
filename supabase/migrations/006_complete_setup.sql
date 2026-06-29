-- ============================================================
-- AI PM Workspace — 完整数据库初始化
-- 在 Supabase SQL Editor 中粘贴执行:
-- https://supabase.com/dashboard/project/fngbkdormyqrmshsqlbx/sql/new
-- ============================================================

-- 1. 文档系统
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#6366f1',
  icon text default 'folder',
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null default '未命名文档',
  content text default '',
  type text not null default 'other',
  tags text[] default '{}',
  project text default '',
  summary text default '',
  action_items text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. AI 对话系统
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  title text default '新对话',
  is_starred boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists messages_conversation_idx on messages(conversation_id);

create or replace function update_conversation_updated_at()
returns trigger as $$
begin
  update conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists messages_update_conversation on messages;
create trigger messages_update_conversation
  after insert on messages
  for each row execute function update_conversation_updated_at();

-- 3. 灵感速记
create table if not exists memos (
  id uuid primary key default gen_random_uuid(),
  title text not null default '未命名灵感',
  content text default '',
  type text not null default 'idea' check (type in ('prompt','idea')),
  tags text[] default '{}',
  category text,
  created_at timestamptz default now()
);

-- 4. Prompt 库
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '未命名 Prompt',
  content text default '',
  category text default 'requirement',
  tags text[] default '{}',
  rating integer default 0,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references prompts(id) on delete cascade,
  content text not null,
  note text default '',
  created_at timestamptz default now()
);

-- 5. 设计资源
create table if not exists design_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  source text not null check (source in ('21st','bento','v0','other')),
  category text not null check (category in ('component','layout','template','other')),
  note text default '',
  image_url text default '',
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- 6. RLS (公开访问 — 本应用不使用 Supabase Auth)
alter table documents enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table memos enable row level security;
alter table prompts enable row level security;
alter table prompt_versions enable row level security;
alter table design_resources enable row level security;

create policy "public_access" on documents for all using (true);
create policy "public_access" on conversations for all using (true);
create policy "public_access" on messages for all using (true);
create policy "public_access" on memos for all using (true);
create policy "public_access" on prompts for all using (true);
create policy "public_access" on prompt_versions for all using (true);
create policy "public_access" on design_resources for all using (true);
