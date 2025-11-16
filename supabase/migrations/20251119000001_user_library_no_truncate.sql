-- Ensure indexes and policies without truncation
alter table public.user_library enable row level security;

create policy if not exists user_library_select_own on public.user_library for select to authenticated using (user_id = auth.uid());
create policy if not exists user_library_insert_own on public.user_library for insert to authenticated with check (user_id = auth.uid());
create policy if not exists user_library_update_own on public.user_library for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists user_library_delete_own on public.user_library for delete to authenticated using (user_id = auth.uid());

create index if not exists user_library_user_created_idx on public.user_library (user_id, created_at desc);
create index if not exists user_library_user_url_idx on public.user_library (user_id, url);
create index if not exists user_library_metadata_gin on public.user_library using gin (metadata);