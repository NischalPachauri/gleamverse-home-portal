## Goals
- Consolidate the reader’s two headers into one unified, responsive bar while preserving all controls and functionality.
- Investigate and fix book cover loading behavior: requests, rendering, caching, error handling, and resource management.
- Add monitoring to track image load success rates, performance metrics, and user interactions.
- Ship regression tests to prevent functional or performance regressions.

## Scope & Key References
- First header: `src/pages/BookDetail.tsx:28–48` (book info + back button).
- Second header: `src/components/PDFReader.tsx:548–665` (controls bar).
- Image components: `src/components/EnhancedImage.tsx`, `src/components/ImageWithFallback.tsx`.
- Existing performance UI: `src/components/PerformanceDashboard.tsx` (extend for new metrics).

## Unified Reader Header Design
1. Merge controls from PDFReader into the BookDetail header.
   - Controls to move: previous/next, page indicator, “Go to” input, zoom in/out with percentage, save/unsave, night mode toggle, fullscreen, download, two/single page toggle.
   - Keep book thumbnail, title, author, and “Back to Library” on the left.
2. Layout & responsiveness
   - Use a single `header` with a 3-zone flex layout:
     - Left: back + thumbnail + title/author.
     - Middle: navigation cluster (prev/next, page indicator, “Go to”, zoom + percentage).
     - Right: actions cluster (save, night mode, fullscreen, download, two/single).
   - Wrap on small screens: actions collapse into a single “More” menu; critical controls (prev/next, zoom) remain visible.
3. Reader integration
   - Remove the internal controls bar in `PDFReader` and pass handler props to the unified header.
   - Keep fullscreen behavior: header becomes fixed and auto-hides in fullscreen after inactivity.
   - Maintain keyboard shortcuts and touch gestures (left/right arrows, swipe).

## Investigation: Book Cover Loading
1. Network request analysis
   - Use `PerformanceObserver({ entryTypes: ['resource'] })` to record cover request timings and status.
   - Capture `initiatorType === 'img'` entries for cover URLs resolved via `getBookCover`.
2. Rendering performance metrics
   - Mark/measure around image mount and `onLoad` using `performance.mark/measure`.
   - Record decode durations where available.
3. Caching evaluation
   - Inspect current shared `window.__coverCache` usage and browser cache behavior.
   - Verify duplicate fetch elimination and cache hit ratios.
4. Error handling implementation
   - Validate fallback pathways (default cover, inline SVG) and error counters.

## Fixes & Optimizations
1. Loading optimization
   - Continue viewport-based loading (`IntersectionObserver`) for `EnhancedImage` and proactive prefetch for current page.
   - Use `decoding="async"` and `fetchpriority="high"` for first viewport covers.
   - Add `link rel="preload"` for the top 4 visible covers of current page (server-rendered head or runtime inject).
2. Error states & transitions
   - Keep subtle opacity transition only on image reveal (no page transitions) for clear visual feedback.
   - Ensure robust fallbacks: default cover asset for errors; log error events for metrics.
3. Memory management
   - Cap `window.__coverCache` size (e.g., 256 entries) and purge least-recently-used on overflow.
   - Clean up observers on unmount; avoid retaining component refs.
   - Revoke object URLs if any blob flows are introduced (not currently used for static assets).

## Monitoring & Telemetry
1. Metrics to collect
   - Image load success/failure counts per route and per session.
   - Resource timing: responseEnd-startTime, decoded size (when available).
   - User interactions: hover, click on covers, scroll depth in browse grid.
2. Integration
   - Create a lightweight metrics context/store and surface summary in `PerformanceDashboard`.
   - Console-safe logging for local dev; future adapter for remote analytics (no third-party libs assumed).

## Regression Tests
1. Header consolidation tests (Vitest + Testing Library)
   - Assert unified header renders all controls; verify accessible labels and ARIA.
   - Simulate small/medium/large breakpoints and ensure clusters wrap correctly.
   - Verify keyboard shortcuts still operate page navigation.
2. Book cover tests
   - Mock `Image` load success and failure to assert fallback and spinner behavior.
   - Validate lazy loading triggers on intersection and prefetch reduces time-to-display.
3. Performance assertions
   - Use synthetic timers and mocked performance entries to ensure metrics collector records marks/measures.

## Implementation Steps
1. Create unified header component or extend `BookDetail` header to accept control handlers from `PDFReader`.
2. Refactor `PDFReader` to expose callbacks/state to parent (pageNumber, numPages, zoom, nightMode, fullscreen, save state) via props or context; remove its internal header.
3. Wire event handlers and state updates across unified header and reader.
4. Add metrics collector (resource timing + image events) and expose in `PerformanceDashboard`.
5. Add tests covering header, cover image behavior, and metrics capture.
6. Manual verification across routes: 
   - Reading view in single/two-page, night/day, fullscreen.
   - Browse pagination and category filters.
   - Slow network simulation for image failures.

## Rollout & Validation
- Ship behind a feature flag if desired; default ON after verification.
- Compare before/after metrics: initial cover TTI, load failure rate, user interaction responsiveness.
- Confirm no layout shift and no duplicate controls.

## Notes
- No new external dependencies; rely on existing React, Tailwind, and browser APIs.
- Maintain current visual hierarchy and spacing while reducing vertical overhead with a single bar.