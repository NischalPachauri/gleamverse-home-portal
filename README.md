# Gleamverse Home Portal

A modern, feature-rich library management and reading tracking application built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure sign-up, sign-in, and password reset using Supabase Auth.
- **Book Management**: Browse, search, and filter a library of books.
- **Reading Tracking**: Track reading progress, set bookmarks, and manage reading lists (Planning, Reading, On Hold, Completed, Favorites).
- **Profile Management**: Customizable user profiles with avatars, reading goals, and history.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS and Shadcn UI.
- **Dark Mode**: Seamless dark/light mode toggling.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Backend/Auth**: Supabase
- **Testing**: Vitest, Playwright

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd gleamverse-home-portal
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run test`: Run unit tests with Vitest.
- `npm run test:e2e`: Run end-to-end tests with Playwright.

## Project Structure

- `src/components`: Reusable UI components.
- `src/contexts`: React contexts for global state (Auth, Theme).
- `src/data`: Static data and mock objects.
- `src/hooks`: Custom React hooks.
- `src/pages`: Application pages/routes.
- `src/types`: TypeScript type definitions.
- `src/utils`: Utility functions.

## Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
