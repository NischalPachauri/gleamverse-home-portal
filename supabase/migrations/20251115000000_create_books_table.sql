create table if not exists public.books (
  id text primary key,
  title text not null,
  author text,
  genre text,
  description text,
  cover_image text,
  pdf_path text not null,
  publish_year integer,
  pages integer,
  rating numeric,
  language text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;

create policy "books are readable to all"
  on public.books for select
  to anon, authenticated
  using (true);

create index if not exists books_title_idx on public.books using gin (to_tsvector('english', coalesce(title,'')));
create index if not exists books_author_idx on public.books using gin (to_tsvector('english', coalesce(author,'')));
create index if not exists books_genre_idx on public.books (genre);
create index if not exists books_tags_idx on public.books using gin (tags);