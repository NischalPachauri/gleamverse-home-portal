# Book Covers Loading – Investigation & Fix

## Summary
Book covers intermittently failed to load due to eager preloading across pages and occasional mapping/file mismatches. Loading is now visibility‑based and failures show a reliable default cover.

## Root Cause
- Eager prefetching in the Browse grid triggered network requests for many covers at once, causing contention and failures on slower networks.
- Some titles lacked mappings or referenced non‑existent filenames, leading to 404s.

## Fixes Implemented
- Replaced eager prefetch with intersection‑based lazy loading in `EnhancedImage`.
- Standardized fallback to `/BookCoversNew/default-book-cover.png` when an image fails.
- Kept `loading="lazy"` and `decoding="async"` for better performance.

## Code Changes
- `src/components/EnhancedImage.tsx`: Add `IntersectionObserver` gating; use default cover fallback on error.
- `src/pages/Index.tsx`: Remove preloading effect for current page covers.

## Verification Steps
1. Open Network tab and filter by `Img`; navigate pages; only current page covers should request.
2. Check status codes are 200; failed requests should render the default cover.
3. Test with throttling (e.g., Fast 3G) and offline to confirm graceful fallbacks.

## Performance
- Loads only visible covers, reducing concurrent requests and memory.
- Maintains smooth scrolling and page jumps without intermediate loads.

## Recommendations
- Periodically run mapping validation scripts to catch missing files.
- Consider adding responsive `srcset` for high‑DPI optimization if needed.

