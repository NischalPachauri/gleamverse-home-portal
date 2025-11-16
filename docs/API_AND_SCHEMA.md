API Endpoints and Schema

Database Tables

- `public.user_library`
  - id uuid primary key
  - user_id uuid FK auth.users
  - url text
  - title text
  - metadata jsonb (includes `{ book_id, status }`)
  - created_at timestamptz
  - unique (user_id, url)
  - RLS: owner-only CRUD via `auth.uid()`
  - Indexes: `(user_id, created_at desc)`, `(user_id, url)`, GIN on `metadata`

- `public.reading_history`
  - user_id uuid, book_id text, last_read_page int, last_read_at timestamptz, total_pages int
  - Indexes: `(user_id, last_read_at desc)`, `(user_id, book_id)`

- `public.books` (optional read-only)
  - id text, title text, author text, genre text, tags text[], pdf_path text
  - Indexes: text-search on title, author; `(genre)`; GIN on tags

REST Examples (PostgREST)

- List bookmarks:
  - `GET /rest/v1/user_library?user_id=eq.<uid>&select=metadata,url,title,created_at&order=created_at.desc`
- Add bookmark:
  - `POST /rest/v1/user_library` body: `{ user_id, url, title, metadata: { book_id, status } }`
- Update status:
  - `PATCH /rest/v1/user_library?user_id=eq.<uid>&metadata->>book_id=eq.<id>` body: `{ metadata: { book_id: <id>, status: <status> } }`
- Remove bookmark:
  - `DELETE /rest/v1/user_library?user_id=eq.<uid>&metadata->>book_id=eq.<id>`

Error Handling

- 400 Bad Request: validate JSON filters and casts; prefer `.contains('metadata', { book_id })` via client SDK.
- PGRST205 (table not found): ensure migrations pushed; restart API if cache is stale.
- Auth failures: ensure user is authenticated and RLS policies are present.