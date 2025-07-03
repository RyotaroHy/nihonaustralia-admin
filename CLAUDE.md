# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Overview

NihonAustralia Admin is the administrative panel for the NihonAustralia platform. It provides tools
for managing users, posts, notices, and platform statistics.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server on http://localhost:3002
- `npm run build` - Build production bundle
- `npm run start` - Start production server on http://localhost:3001

### Code Quality Commands

- `npm run lint` - Run Next.js ESLint checks
- `npm run lint:check` - Run ESLint checks on all files
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check Prettier formatting
- `npm run typecheck` - Run TypeScript type checking
- `npm run check-all` - Run all checks (lint, typecheck, format)
- `npm run fix-all` - Auto-fix linting and formatting issues

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

## Code Quality & Standards

### Automated Code Quality

The project includes a comprehensive code quality setup:

- **ESLint**: Next.js 15 best practices with flat config format
- **Prettier**: Consistent code formatting with organize-imports plugin
- **Husky**: Git hooks for automated quality checks
- **lint-staged**: Pre-commit formatting and linting
- **commitlint**: Conventional commit message enforcement

### Pre-commit Hooks

Every commit automatically:

1. Runs ESLint with auto-fix on staged files
2. Formats code with Prettier
3. Validates TypeScript types
4. Enforces conventional commit messages

### Configuration Files

- `eslint.config.mjs` - ESLint flat config with security and quality rules
- `.prettierrc.json` - Prettier formatting configuration
- `commitlint.config.js` - Commit message rules
- `.husky/` - Git hooks configuration
- `.eslintignore` / `.prettierignore` - File patterns to ignore

## Important Notes

### Port Configuration

The admin panel runs on port 3002 for development and port 3001 for production to avoid conflicts
with the main web app (port 3000).

### Authentication

Currently uses the same authentication system as the main web app. Admin access control should be
implemented based on user roles.

### Database Access

Uses the same Supabase database as the main web app. Admin features should have appropriate
permissions and access controls.

### Type Safety

- Always run `npm run typecheck` before committing
- Share types with main web app when possible
- Use proper TypeScript for all components and functions
