alter table public.books enable row level security;

create policy if not exists books_insert_auth on public.books for insert to authenticated with check (true);
create policy if not exists books_update_auth on public.books for update to authenticated using (true) with check (true);