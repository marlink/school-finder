# Development Guidelines

This document outlines the technical standards, best practices, and development workflows for the School Finder Production project.

## SSR Compatibility Requirements

### Client-Side Only Hooks

All components using `useSearchParams()` MUST be wrapped in `<Suspense>` boundaries to prevent SSR errors.

Components accessing `document`, `window`, or browser APIs MUST use:
- `useEffect()` for initialization
- Conditional rendering with `typeof window !== 'undefined'`
- Dynamic imports with `{ ssr: false }` when appropriate

### Required Patterns

```tsx
// For useSearchParams
<Suspense fallback={<LoadingSpinner />}>
  <ComponentUsingSearchParams />
</Suspense>

// For browser APIs
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Browser-specific code here
  }
}, []);
```

## Internationalization Standards

### Supported Locales

- **Polish:** `pl.json`
- **English (UK):** `eng.json`

### Locale Configuration

- All locale codes MUST be defined in `src/i18n.ts`
- Locale files MUST exist in `/messages/` directory
- UI components MUST only reference supported locales
- Admin settings MUST reflect current supported languages

### Naming Convention

- Use ISO 639-1 codes where possible
- For regional variants, use descriptive names (e.g., `eng` for English UK)

## Build Process Validation

### Test Files

- Test pages MUST be prefixed with `_test-` or placed in `/tests/` directory
- Test pages MUST NOT be included in production builds
- Use `.test.tsx` or `.spec.tsx` extensions for test files

### Build Validation

- MUST run `npm run build` before any deployment
- MUST verify all pages render without SSR errors
- MUST check for unused imports and files

### File Organization

- Remove unused locale files immediately when reducing language support
- Clean up test files that are no longer needed
- Maintain consistent naming conventions across the codebase

## Code Quality Standards

### Import Requirements

- ALL imports MUST use exact case matching
- Component imports MUST match file names exactly
- Use absolute imports from `src/` when possible

### Type Safety

- ALL components MUST have proper TypeScript types
- Props interfaces MUST be defined for all components
- API responses MUST have corresponding type definitions

### Error Prevention

- Use ESLint rules for import case sensitivity
- Enable TypeScript strict mode
- Implement pre-commit hooks for build validation

## Development Workflow

### Before Committing

1. Run `npm run build` to verify production build
2. Run `npm run dev` to test development server
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Verify all pages load without console errors

### Locale Changes

1. Update `src/i18n.ts` configuration
2. Remove unused locale files
3. Update admin settings UI
4. Test language switching functionality
5. Verify build success after changes

## Component Development

### File Naming

- Use PascalCase for component files: `MyComponent.tsx`
- Use kebab-case for utility files: `my-utility.ts`
- Use camelCase for hook files: `useMyHook.ts`

### Component Structure

```tsx
// ComponentName.tsx
import { type ComponentProps } from './types'

interface ComponentNameProps {
  // Define props here
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Component implementation
}

export default ComponentName
```

### Styling Guidelines

- Use Tailwind CSS classes for styling
- Create custom components in `src/components/ui/` for reusable elements
- Follow the established design system patterns

## API Development

### Route Handlers

- Place API routes in `src/app/api/`
- Use proper HTTP status codes
- Implement error handling for all endpoints
- Add TypeScript types for request/response objects

### Database Operations

- Use Supabase client for database operations
- Implement proper error handling
- Use transactions for complex operations
- Follow the established schema patterns

## Testing Standards

### Unit Tests

- Write tests for utility functions
- Test component props and behavior
- Use Jest and React Testing Library

### E2E Tests

- Use Playwright for end-to-end testing
- Test critical user journeys
- Include mobile and desktop scenarios

### Test Organization

```
tests/
├── e2e/           # Playwright tests
├── unit/          # Jest unit tests
└── fixtures/      # Test data and utilities
```

## Performance Guidelines

### Code Splitting

- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load non-critical components

### Image Optimization

- Use Next.js Image component
- Provide appropriate alt text
- Use WebP format when possible

### Bundle Analysis

- Regularly analyze bundle size with `npm run analyze`
- Remove unused dependencies
- Optimize import statements

## Security Best Practices

### Environment Variables

- Never commit secrets to version control
- Use `.env.local` for local development
- Validate environment variables at startup

### Authentication

- Use Supabase Auth for user management
- Implement proper session handling
- Validate user permissions on API routes

### Data Validation

- Validate all user inputs
- Use TypeScript for compile-time safety
- Implement runtime validation with Zod

## Deployment Checklist

### Pre-deployment

- [ ] All tests pass
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Database migrations applied

### Post-deployment

- [ ] Verify application loads correctly
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check performance metrics

## Troubleshooting Common Issues

### Build Failures

1. Check for TypeScript errors: `npx tsc --noEmit`
2. Verify all imports are correct
3. Ensure all required environment variables are set
4. Check for unused files in the build

### SSR Errors

1. Wrap client-side hooks in `<Suspense>`
2. Use `useEffect` for browser-specific code
3. Check for `document` or `window` usage in components

### Locale Issues

1. Verify locale files exist in `/messages/`
2. Check `src/i18n.ts` configuration
3. Ensure UI components reference correct locales

---

*This document should be updated as the project evolves and new standards are established.*