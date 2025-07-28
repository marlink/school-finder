# Development Guide

## 🚨 Critical Development Rules

### Terminal Command Rules
**BEFORE executing ANY terminal command, ALWAYS:**
1. Check current working directory with `pwd`
2. Ensure you are in `/Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder-production`
3. If not, navigate there first: `cd /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder-production`

**NEVER use `&` or `&&` in terminal commands**
- ❌ BAD: `npm run build && npm start`
- ✅ GOOD: Execute commands separately

### Repository Configuration
- **GitHub Repository**: Always push to `marlink` account repositories
- **Never push to**: `mc-design` or `design-mc` repositories
- **Verify remote**: Always check `git remote -v` before pushing

## Build Process & Deployment

### Prisma Requirements
- **Build Script**: MUST be `"build": "prisma generate && next build"`
- **Deployment**: Prisma CLI must be in devDependencies for Vercel builds
- **Local Development**: Run `npx prisma generate` after schema changes
- **Database Changes**: Always run `npx prisma db push` after schema updates

### Build Validation
- MUST run `npm run build` before any deployment
- MUST verify all pages render without SSR errors
- MUST check for unused imports and files

### Deployment Checklist
Before any deployment:
1. ✅ Verify working directory
2. ✅ Check Supabase connection
3. ✅ Test local build
4. ✅ Verify environment variables
5. ✅ Commit all changes
6. ✅ Push to correct repository

## SSR Compatibility

### Client-Side Only Hooks
All components using `useSearchParams()` MUST be wrapped in `<Suspense>` boundaries:

```tsx
<Suspense fallback={<LoadingSpinner />}>
  <ComponentUsingSearchParams />
</Suspense>
```

### Browser APIs
Components accessing `document`, `window`, or browser APIs MUST use:

```tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Browser-specific code here
  }
}, []);
```

## Code Quality Standards

### Import Requirements
- ALL imports MUST use exact case matching
- Component imports MUST match file names exactly
- Use absolute imports from `src/` when possible

### Type Safety
- ALL components MUST have proper TypeScript types
- Props interfaces MUST be defined for all components
- API responses MUST have corresponding type definitions

### Logging Standards
1. **Development Logging**: Use `if (process.env.NODE_ENV === 'development')` wrapper for debug logs
2. **Error Logging**: Keep `console.error` statements for production error tracking
3. **Warning Logging**: Keep `console.warn` for important production warnings

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

## Internationalization

### Supported Locales
- **Polish:** `pl.json`
- **English (UK):** `eng.json`

### Locale Configuration
- All locale codes MUST be defined in `src/i18n.ts`
- Locale files MUST exist in `/messages/` directory
- UI components MUST only reference supported locales

### Naming Convention
- Use ISO 639-1 codes where possible
- For regional variants, use descriptive names (e.g., `eng` for English UK)

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

### Test Organization
```
tests/
├── e2e/           # Playwright tests
├── unit/          # Jest unit tests
└── fixtures/      # Test data and utilities
```

### Test Files
- Test pages MUST be prefixed with `_test-` or placed in `/tests/` directory
- Test pages MUST NOT be included in production builds
- Use `.test.tsx` or `.spec.tsx` extensions for test files

## Performance Guidelines

### Code Splitting
- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load non-critical components

### Image Optimization
- Use Next.js Image component
- Provide appropriate alt text
- Use WebP format when possible

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

---

**These rules are MANDATORY for all future development work.**