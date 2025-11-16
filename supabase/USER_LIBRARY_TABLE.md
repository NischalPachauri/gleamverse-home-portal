# Supabase User Library Table (Bookmarks)

## Table: public.user_library
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `url text not null` — bookmark URL (e.g. PDF path)
- `title text not null` — display title
- `metadata jsonb not null default '{}'` — arbitrary metadata, includes `book_id` and `status`
- `created_at timestamptz not null default now()`
- `unique (user_id, url)`

## Indexes
- `user_library_user_created_idx` on `(user_id, created_at desc)`
- `user_library_user_url_idx` on `(user_id, url)`
- `user_library_metadata_gin` GIN index on `metadata`

## RLS Policies
- Select/Insert/Update/Delete restricted to `authenticated` users where `user_id = auth.uid()`.

## Error Handling Notes
- If client receives `PGRST205` (table not found in schema cache), ensure migrations are pushed or create the table via SQL.
- Permission errors are resolved by ensuring policies above are present and the client uses an authenticated session.

## Migration Commands
- Create: `supabase/migrations/20251115_create_user_library_table.sql`
- Repair (when local/remote mismatch):
  - `npx supabase migration repair --status reverted 20240626000000 20251114`
  - `npx supabase db push`

## Verification
- Insert sample row
- Select rows by `user_id`
- Attempt to fetch a non-existent bookmark and expect 404 from PostgREST.