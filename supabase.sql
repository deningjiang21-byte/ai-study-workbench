create extension if not exists "pgcrypto";

create table if not exists public.learning_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  preview text default '',
  result_snippet text default '',
  module_title text default '',
  module text default '',
  scene text default '',
  keywords jsonb default '[]'::jsonb,
  learning_goal text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_explanation text default '',
  preferred_scenes jsonb default '[]'::jsonb,
  stage text default '',
  top_modules jsonb default '[]'::jsonb,
  top_keywords jsonb default '[]'::jsonb,
  top_scenes jsonb default '[]'::jsonb,
  memory_count integer default 0,
  recent_topics jsonb default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learning_memories enable row level security;
alter table public.learning_profiles enable row level security;

drop policy if exists "users_manage_own_memories" on public.learning_memories;
create policy "users_manage_own_memories"
on public.learning_memories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users_manage_own_profiles" on public.learning_profiles;
create policy "users_manage_own_profiles"
on public.learning_profiles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
