create table conversations (
  id uuid primary key default gen_random_uuid(),
  title text default '新对话',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index messages_conversation_idx on messages(conversation_id);

create or replace function update_conversation_updated_at()
returns trigger as $$
begin
  update conversations set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger messages_update_conversation
  after insert on messages
  for each row execute function update_conversation_updated_at();

-- RLS policies
alter table conversations enable row level security;
create policy "Enable all for all users" on conversations for select using (true);
create policy "Enable all for all users" on conversations for insert with check (true);
create policy "Enable all for all users" on conversations for update using (true) with check (true);
create policy "Enable all for all users" on conversations for delete using (true);

alter table messages enable row level security;
create policy "Enable all for all users" on messages for select using (true);
create policy "Enable all for all users" on messages for insert with check (true);
create policy "Enable all for all users" on messages for update using (true) with check (true);
create policy "Enable all for all users" on messages for delete using (true);
