create table if not exists public.user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.books(id) on delete cascade,
  status text not null default 'Planning to Read' check (status in ('Planning to Read','Reading','On Hold','Completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.user_bookmarks enable row level security;

create policy "read own bookmarks"
  on public.user_bookmarks for select
  to authenticated
  using (user_id = auth.uid());

create policy "insert own bookmarks"
  on public.user_bookmarks for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "update own bookmarks"
  on public.user_bookmarks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "delete own bookmarks"
  on public.user_bookmarks for delete
  to authenticated
  using (user_id = auth.uid());

create index if not exists user_bookmarks_user_created_idx on public.user_bookmarks (user_id, created_at desc);
create index if not exists user_bookmarks_user_status_idx on public.user_bookmarks (user_id, status);
create index if not exists user_bookmarks_item_idx on public.user_bookmarks (item_id);
