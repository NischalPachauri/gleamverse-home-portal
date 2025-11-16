# Missing Book Covers: Causes and Fixes

This project renders covers using `getBookCover(title)` in `src/utils/bookCoverMapping.ts`. When a cover is missing, the UI falls back to `/placeholder.svg` with `ImageWithFallback` in components like `src/components/BookCoverGallery.tsx` and `src/components/ReadingList.tsx`.

Common causes:

- Title mismatches: The book’s `title` does not exactly match a key in `bookCoverMapping.ts`.
- Filename variations: The image in `public/BookCoversNew/` uses different casing, spacing, punctuation, or file extension.
- Absent assets: The expected file is not present under `public/BookCoversNew/`.
- Mapping gaps: No entry exists for the title in `bookCoverMapping.ts`.
- Special characters: Apostrophes, accents, symbols stripped or altered during normalization.
- Multiple editions: Similar titles mapped to the wrong edition or none at all.

How it works:

- Exact mapping: `bookCoverMapping.ts` maps known titles to specific files under `public/BookCoversNew/`.
- Heuristic match: `findBestMatch(title)` in `src/utils/bookCoverUtils.ts` attempts acronym and token similarity when exact match fails; returns `null` if confidence is low.
- Fallback: Components use `ImageWithFallback` to render `/placeholder.svg` instead of breaking the UI when an image fails.

Steps to fix a missing cover:

- Verify the image exists in `public/BookCoversNew/` and is reachable.
- Ensure the `title` string in `src/data/books.ts` exactly matches the key used in `bookCoverMapping.ts`.
- Add or correct the mapping entry in `bookCoverMapping.ts` to point to the right filename.
- Keep consistent casing and punctuation between titles and filenames.
- Prefer `.jpg` or `.png` extensions present in `public/BookCoversNew/`.
- If relying on heuristics, consider adding an explicit mapping to avoid ambiguity.

Diagnostics tips:

- Check the browser network panel for 404s or load errors on cover URLs.
- Log the resolved path from `getBookCover(title)` to verify the mapping.
- Confirm the component receives the expected `title` and that it matches the mapping key.

References:

- `src/utils/bookCoverMapping.ts`
- `src/utils/bookCoverUtils.ts`
- `src/components/BookCoverGallery.tsx`
- `src/components/ReadingList.tsx`
