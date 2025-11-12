## Overview

* Strengthen PDF opening by validating filenames and file integrity before rendering, and improve user-facing error messages. Keep existing valid PDFs opening smoothly in the `PDFReader` while providing clear guidance when issues occur.

## Current Implementation & Hook Points

* `src/components/PDFReader.tsx:34` defines the reader component and normalizes the path (`src/components/PDFReader.tsx:36`).

* PDF.js worker configuration is set with local bundling and CDN fallback (`src/components/PDFReader.tsx:16–23`).

* The Document viewer renders the PDF and calls load handlers (`src/components/PDFReader.tsx:847–869`).

* Load error handler already maps common PDF.js errors to friendly text (`src/components/PDFReader.tsx:138–164`).

* Page hosts the reader: `src/pages/BookDetail.tsx:52`.

* PDF test harness: `src/components/PDFTest.tsx:10–14` with route `src/App.tsx:51`.

* Source of paths: `src/data/books.ts` (e.g., `Elmer s Friends.pdf` at `src/data/books.ts:744`); actual assets under `public/books/`.

* Cover mapping shows title naming with spaces in place of apostrophes (e.g., `src/utils/bookCoverMapping.ts:278`).

## Issues Observed

* Filenames include spaces and pseudo-apostrophes (`s`) and varied casing; no explicit filename validation exists.

* No MIME type or size validation before rendering; only a HEAD status check logs results.

* Error messages do not distinguish corrupted PDFs vs filename/compatibility issues.

## Plan

### Phase 1: Preflight File Integrity Check

* Add a lightweight `HEAD` preflight in `PDFReader` that runs before rendering:

  * Validate `Content-Type` includes `application/pdf`.

  * Validate `Content-Length` > 0.

  * On failure, show a targeted error and skip rendering the `Document`.

* Keep behavior tolerant: if headers are missing but status is OK, allow rendering and rely on `onLoadError` to catch issues.

### Phase 2: Filename Validation

* Implement a `validatePdfFilename(path)` in `PDFReader` executed before the preflight:

  * Ensure `.pdf` extension (case-insensitive).

  * Enforce allowed characters: `[A-Za-z0-9 _().,-]` and spaces; reject other special characters.

  * Enforce filename length (≤ 200 chars).

  * Return specific failure reason.

* If invalid, display an actionable error and skip the render; offer “Download and open externally” as a fallback.

### Phase 3: Error Handling & Messaging

* Enhance `onDocumentLoadError` (`src/components/PDFReader.tsx:138–164`) to distinguish:

  * Corrupted/invalid PDF: “The file appears corrupted or not a valid PDF.”

  * Filename mismatch/requirements: “The filename doesn’t meet requirements (allowed: letters, numbers, spaces, `_()-.,`). Ensure extension is `.pdf`.”

  * Reader compatibility: “Your current reader had issues. Try Acrobat or download the file.”

* Add a pre-render banner in the reader when validation fails, using existing `toast` plus inline text.

### Phase 4: Document Expected vs Actual Patterns

* Document the repository’s effective pattern (examples from `public/books/`): spaces allowed; apostrophes often represented as space+`s` (e.g., `Elmer s Friends.pdf`).

* Define expected pattern to reduce issues:

  * Use spaces or hyphens; avoid quotes/apostrophes and non-ASCII characters.

  * Keep ASCII `[A-Za-z0-9 _().,-]`; length ≤ 200; `.pdf` extension.

* Note mismatches in covers vs PDFs (e.g., `src/utils/bookCoverMapping.ts:278` → `elmers friend.jpg` vs `public/books/Elmer s Friends.pdf`).

### Phase 5: Cross-Reader Testing

* Web (current): Verify `PDFTest` route (`src/App.tsx:51`) loads several PDFs with mixed naming.

* Desktop: Download and open in Adobe Acrobat Reader to confirm integrity.

* Browser-based viewers: Open direct `public/books/*.pdf` URLs in Chrome/Edge.

* Mobile: Use native PDF apps (iOS Files, Android Drive/Viewer) by downloading or opening the direct URL.

### Phase 6: Implementation Details (No code edits yet)

* In `PDFReader`, before rendering:

  * `const filenameStatus = validatePdfFilename(normalizedPdfPath);` If failure, set `error` and show message; don’t render `Document`.

  * `const head = await fetch(normalizedPdfPath, { method: 'HEAD' });` Read headers; if invalid, set targeted error and skip render.

  * Render `Document` only when validations pass; continue relying on `onDocumentLoadError` for runtime errors.

* Update `handleDownload` (`src/components/PDFReader.tsx:311` and `src/components/BookCard.tsx:128–136`) to ensure `.pdf` suffix and use `title` sanitization for `download` name.

### Phase 7: Error Message Catalog

* Corrupted PDF: “The file may be corrupted or not a valid PDF.”

* Filename mismatch: “Filename contains unsupported characters or lacks `.pdf` extension.”

* Reader compatibility: “Your browser had trouble rendering this PDF. Try downloading or Acrobat.”

* Not found/inaccessible: “Couldn’t access the file. Check the path or try again later.”

* CORS/server: “Cross-origin or server error blocked loading.”

### Phase 8: Validation Guarantees

* Valid PDFs continue to open as before.

* Invalid cases surface early with clear messages, avoiding ambiguous failures.

* Applies uniformly across platforms by validating server headers and filenames, and by offering external-viewer fallbacks.

### Deliverables After Approval

* Implement validation and preflight in `src/components/PDFReader.tsx`.

* Add consistent error messaging and optional inline banner.

* Sanitize download filenames.

* Verify `PDFTest` and a sample set from `public/books/` on desktop, browser, and mobile.

* Produce a short “Expected vs Actual filename patterns” note for maintainers.

