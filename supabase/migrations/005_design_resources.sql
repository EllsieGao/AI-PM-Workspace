-- Design Resources table
create table if not exists design_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  source text not null check (source in ('21st', 'bento', 'v0', 'other')),
  category text not null check (category in ('component', 'layout', 'template', 'other')),
  note text default '',
  image_url text default '',
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- RLS
alter table design_resources enable row level security;

drop policy if exists "Enable all for all users" on design_resources;
create policy "Enable all for all users" on design_resources for select using (true);
create policy "Enable all for all users" on design_resources for insert with check (true);
create policy "Enable all for all users" on design_resources for update using (true) with check (true);
create policy "Enable all for all users" on design_resources for delete using (true);
