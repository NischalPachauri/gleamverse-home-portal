-- Books table for admin-managed catalog
create table if not exists public.books (
  id text primary key,
  title text not null,
  author text,
  pdf_url text not null,
  cover_url text,
  genre text,
  read_count bigint default 0,
  created_at timestamptz default now()
);

-- Profiles by session (no auth)
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_session_id text not null unique,
  display_name text,
  created_at timestamptz default now()
);

-- Bookmark lists with status
create type if not exists bookmark_status as enum ('plan','reading','on_hold','completed');

create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_session_id text not null,
  book_id text not null,
  status bookmark_status not null default 'reading',
  created_at timestamptz default now(),
  unique(user_session_id, book_id)
);

-- Continue reading (last book per session)
create table if not exists public.read_progress (
  id uuid default gen_random_uuid() primary key,
  user_session_id text not null,
  book_id text not null,
  current_page integer default 1,
  updated_at timestamptz default now(),
  unique(user_session_id, book_id)
);

alter table public.books enable row level security;
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.read_progress enable row level security;

-- Public access policies (session-based app)
create policy "Public read" on public.books for select using (true);
create policy "Public write" on public.books for all using (true) with check (true);

create policy "Profiles access" on public.profiles for all using (true) with check (true);
create policy "Bookmarks access" on public.bookmarks for all using (true) with check (true);
create policy "Read progress access" on public.read_progress for all using (true) with check (true);


