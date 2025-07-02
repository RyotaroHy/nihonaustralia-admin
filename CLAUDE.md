# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NihonAustralia Admin is the administrative panel for the NihonAustralia platform. It provides tools for managing users, posts, notices, and platform statistics.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server on http://localhost:3001
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Testing

- `npm run test` - Run Jest tests in watch mode
- `npm run test:ci` - Run Jest tests once (for CI)
- `npm run test:coverage` - Run tests with coverage report

## Architecture & Code Organization

### Feature-Based Structure

The codebase follows a feature-based architecture:

```
src/
├── features/           # Domain-specific features
│   ├── dashboard/      # Admin dashboard
│   ├── users/          # User management
│   ├── posts/          # Post management
│   └── notices/        # Notice management
├── components/         # Shared UI components
├── app/               # Next.js App Router (routes, layouts, pages)
├── lib/               # Utilities, API clients, configurations
└── types/             # TypeScript type definitions
```

### Feature Module Pattern

Each feature follows a consistent structure:

- `FeatureContainer.tsx` - Data fetching and state management
- `FeaturePresenter.tsx` - Pure UI component receiving props
- `_api/` - API functions and React Query hooks (when needed)
- `_components/` - Feature-specific components (when needed)

### Admin-Specific Components

- `AdminSidebar.tsx` - Navigation sidebar
- `AdminHeader.tsx` - Top header with user info
- Layout components for consistent admin UI

### Data Fetching Architecture

- Uses TanStack Query (React Query) for server state management
- Supabase client for database operations
- Same authentication system as main web app

### UI Components & Styling

- Tailwind CSS for styling
- React Icons (HeroIcons) for icons
- Responsive design with admin-focused layout
- Dark mode support

## Key Patterns

### Container/Presenter Pattern

Always separate data fetching logic from UI:

```typescript
// Container: handles data and state
const FeatureContainer = () => {
  const { data, isLoading } = useFeatureQuery();
  return <FeaturePresenter data={data} loading={isLoading} />;
};

// Presenter: pure UI component
const FeaturePresenter = ({ data, loading }) => {
  // Only UI logic here
};
```

### Component Imports

- Use absolute imports with `@/` prefix
- Organize imports: external libraries, internal modules, types
- Icons: `import { HiUser, HiMail } from 'react-icons/hi';`

## Important Notes

### Port Configuration

The admin panel runs on port 3001 to avoid conflicts with the main web app (port 3000).

### Authentication

Currently uses the same authentication system as the main web app. Admin access control should be implemented based on user roles.

### Database Access

Uses the same Supabase database as the main web app. Admin features should have appropriate permissions and access controls.

### Type Safety

- Always run `npm run typecheck` before committing
- Share types with main web app when possible
- Use proper TypeScript for all components and functions