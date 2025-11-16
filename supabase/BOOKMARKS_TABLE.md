# Supabase User Bookmarks Table

## Table: public.user_bookmarks
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `item_id text not null references public.books(id) on delete cascade`
- `status text not null default 'Planning to Read'` with check in `('Planning to Read','Reading','On Hold','Completed')`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (user_id, item_id)`

## Indexes
- `user_bookmarks_user_created_idx` on `(user_id, created_at desc)`
- `user_bookmarks_user_status_idx` on `(user_id, status)`
- `user_bookmarks_item_idx` on `(item_id)`

## RLS Policies
- Select/Insert/Update/Delete restricted to `authenticated` users where `user_id = auth.uid()`.

## Migration
File: `supabase/migrations/20251115_create_user_bookmarks_table.sql`

### Migration from legacy
- On client load, legacy localStorage `gleamverse_bookmarks` is upserted to `user_bookmarks` once and then cleared.
- Existing `public.user_library` rows are upserted into `user_bookmarks` for continuity.

### Architecture
- Frontend uses a single hook `useBookmarks` for CRUD and subscription.
- Fallback to `user_library` is automatic if `user_bookmarks` isn’t available yet on the remote.
- Basic metrics for operations are recorded in `window.__bookmarkMetrics`.

## Usage Notes
- Read/write via table `public.user_bookmarks`.
- Unique per `(user_id, item_id)` prevents duplicates.
- `status` supports simple workflow; optional `notes` for metadata.