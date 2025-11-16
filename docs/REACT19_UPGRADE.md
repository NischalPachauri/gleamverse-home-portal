React 19 Upgrade Guide

Steps Applied

1. Updated dependencies to React 19:
   - react ^19.0.0
   - react-dom ^19.0.0
   - @types/react ^19.0.0
   - @types/react-dom ^19.0.0

2. Verified entry root uses modern API:
   - `createRoot` in `src/main.tsx` is already compatible.

3. Deprecated APIs removed:
   - No legacy `ReactDOM.render` usages remain.
   - No unsafe lifecycle methods present.

4. Third-party compatibility:
   - `react-router-dom@^6`, `react-pdf@^10`, `@radix-ui/*`, `vitest`, `vite` are compatible with React 18+ and do not rely on deprecated APIs.
   - Monitor for any peer warnings during install; upgrade minor versions where peers request React >=19.

5. Testing:
   - Unit tests render core components and the new ProgressBar.
   - Integration tests cover bookmarks, reading progress, and library views.

Breaking Changes

- If any library pins React 18 as a peer, upgrade it to a version that declares React >=18 || 19.
- Strict mode behaviors may expose warnings in development; address them by cleaning side effects.