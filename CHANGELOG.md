# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Lazy Loading**: Implemented `React.lazy` and `Suspense` for all main routes to improve initial load time.
- **Error Handling**: Added comprehensive error handling with toast notifications for authentication, bookmarks, and profile updates.
- **Documentation**: Added `README.md` with project setup and contribution guidelines.
- **JSDoc**: Added JSDoc comments to key type definitions (`src/types/profile.ts`) and components (`ProfileSidebar`).

### Changed
- **Refactoring**: Split `ProfileWindow.tsx` into smaller, modular components (`ProfileSidebar`, `ReadingGoalsSection`, `ReadingHistorySection`, `FavoritesSection`).
- **Navigation**: Replaced deprecated `window.location.href` and `<a>` tags with React Router's `useNavigate` and `Link` for smoother client-side transitions.
- **Styling**: Standardized styling using Tailwind CSS and Shadcn UI components.
- **Type Definitions**: Centralized profile-related types in `src/types/profile.ts`.

### Fixed
- **ProfileSidebar**: Fixed syntax errors and restored missing props in `ProfileSidebar` component.
- **Type Safety**: Resolved `any` type usages and improved type safety across the codebase.
- **Deprecated APIs**: Removed usage of deprecated React lifecycle methods and DOM access patterns.
