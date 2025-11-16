Books and Covers Import

- Books are defined in `src/data/books.ts` as static entries (id, title, author, genre, pages, pdfPath, etc.).
- Covers are mapped by `src/utils/bookCoverMapping.ts` via `getBookCover(title)`, returning paths under `/BookCoversNew/*.png`.
- Supabase is NOT used for importing book assets or covers; these are served from the app's static assets.
- Fallbacks: when a cover path is invalid, the app displays `/placeholder.svg`.

Supabase Usage

- Supabase is used for user data only:
  - `public.user_library` for bookmarks (url, title, metadata `{ book_id, status }`, created_at)
  - `public.reading_history` for progress (current page, total pages, timestamps)
  - `public.books` for content metadata (optional, read-only)