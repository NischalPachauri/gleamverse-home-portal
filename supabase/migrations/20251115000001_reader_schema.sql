create table if not exists public.books (
  id text primary key,
  title text
);

alter table public.books enable row level security;

create policy if not exists books_select_all on public.books for select using (true);
create policy if not exists books_insert_any on public.books for insert with check (true);
create policy if not exists books_update_any on public.books for update using (true) with check (true);

create table if not exists public.reading_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  last_read_page integer not null default 1,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.reading_history enable row level security;

create unique index if not exists reading_history_user_book_unique on public.reading_history (user_id, book_id);

create policy if not exists rh_select_own on public.reading_history for select using (auth.uid() = user_id);
create policy if not exists rh_insert_own on public.reading_history for insert with check (auth.uid() = user_id);
create policy if not exists rh_update_own on public.reading_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists rh_delete_own on public.reading_history for delete using (auth.uid() = user_id);