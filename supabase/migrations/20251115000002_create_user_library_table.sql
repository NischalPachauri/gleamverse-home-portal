create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

create table if not exists public.user_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, url)
);

alter table public.user_library enable row level security;

DROP POLICY IF EXISTS "read own library" ON public.user_library;

CREATE POLICY "read own library"
  on public.user_library for select
  to authenticated
  using (user_id = auth.uid());

DROP POLICY IF EXISTS "insert own library" ON public.user_library;

CREATE POLICY "insert own library"
  on public.user_library for insert
  to authenticated
  with check (user_id = auth.uid());


DROP POLICY IF EXISTS "update own library" ON public.user_library;
create policy "update own library"
  on public.user_library for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


DROP POLICY IF EXISTS "delete own library" ON public.user_library;
create policy "delete own library"
  on public.user_library for delete
  to authenticated
  using (user_id = auth.uid());

create index if not exists user_library_user_created_idx on public.user_library (user_id, created_at desc);
create index if not exists user_library_user_url_idx on public.user_library (user_id, url);
create index if not exists user_library_metadata_gin on public.user_library using gin (metadata);

-- Cleanup: delete existing rows to start fresh (safe even after creation)
truncate table public.user_library;