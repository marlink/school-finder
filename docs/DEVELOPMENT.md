# 🚀 Development Guide

## 🎯 Project Status
- **Current Phase**: Production Ready ✅
- **Security Score**: 10/10 ⭐
- **Build Status**: ✅ Passing
- **Development Server**: http://localhost:3001
- **Environment**: STAGING (recommended for development)

## 🚨 Critical Development Rules

### 📍 Location & Environment Awareness
- **ALWAYS check current directory**: Run `pwd` before ANY npm commands
- **ALWAYS verify environment**: Check which environment (.env) is active before commits
- **ALWAYS confirm Git branch**: Know exactly what branch you're on and where you're pushing

### 🔒 Security & Data Protection
- **NEVER EVER expose sensitive data**: No passwords, URLs, API keys, personal data, or credentials
- **ALWAYS assume documents will be committed**: Write documentation as if it will be public
- **DOUBLE-CHECK before saving**: Review all content for sensitive information

### 🚀 Quick Start Commands

```bash
# Environment setup (run once)
npm run env:staging    # 🔧 For daily development (RECOMMENDED)

# Daily development workflow
npm run dev           # Start development server on port 3001
npm run build         # Test production build
npm run security:test # Run security tests (33 tests)
```

## 🛠️ Development Environment Setup

### Prerequisites
- Node.js 18+ installed
- Git configured
- Environment variables configured

### Initial Setup
```bash
# 1. Navigate to project directory
cd /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder

# 2. Install dependencies
npm install

# 3. Set up environment (STAGING recommended)
npm run env:staging

# 4. Generate Prisma client
npx prisma generate

# 5. Start development server
npm run dev
```

### Health Check
```bash
# Verify everything is working
curl http://localhost:3001/api/health | jq
```

## 🏗️ Project Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL (Prisma ORM)
- **Authentication**: Stack Auth (100% migrated)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Security**: 10/10 score with automated testing

### Directory Structure
```
src/
├── app/                 # Next.js app directory (routes)
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── middleware.ts       # Request middleware
```

## 🔧 Development Workflow

### Daily Development Process
1. **Start Session**
   ```bash
   pwd                    # Verify location
   git status            # Check branch and changes
   npm run env:staging   # Ensure staging environment
   npm run dev           # Start development server
   ```

2. **Development Loop**
   - Make changes
   - Test in browser (http://localhost:3001)
   - Run security tests: `npm run security:test`
   - Commit changes with clear messages

3. **Before Committing**
   ```bash
   npm run build         # Verify production build
   npm run security:test # Ensure security compliance
   git add .
   git commit -m "feat: descriptive message"
   ```

### Branch Strategy
- **main**: Production-ready code
- **staging**: Development and testing
- **feature/***: Individual feature development

## 🧪 Testing & Quality Assurance

### Available Test Commands
```bash
# Security testing (33 tests)
npm run security:test     # Full security suite
npm run security:audit   # Dependency vulnerability check

# Build testing
npm run build            # Production build test
npm run type-check       # TypeScript validation

# Development testing
npm run dev              # Development server
```

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Security**: Automated testing with 10/10 score
- **Performance**: Optimized builds and lazy loading

## 🔐 Security Guidelines

### Security Features (10/10 Score)
- **Input Validation**: Zod schemas for all API inputs
- **XSS Prevention**: 15+ pattern detection and sanitization
- **SQL Injection Protection**: Parameterized queries via Prisma
- **CSRF Protection**: Token-based protection system
- **Rate Limiting**: Configurable per-endpoint limits
- **Authentication**: Stack Auth with JWT validation

### Security Best Practices
1. **Always validate input** using Zod schemas
2. **Use security middleware** for all API routes
3. **Implement proper error handling** without information leakage
4. **Regular security testing** before deployments
5. **Keep dependencies updated** with security patches

### Security Commands
```bash
npm run security:test    # Run all 33 security tests
npm run security:full    # Complete security validation
npm run security:audit  # Check for vulnerabilities
```

## 🗄️ Database Development

### Prisma Workflow
```bash
# After schema changes
npx prisma generate      # Generate client
npx prisma db push       # Push schema to database
npx prisma studio        # Open database browser
```

### Database Environments
- **STAGING**: Safe for development (recommended)
- **PRODUCTION**: Live data (use with caution)
- **TESTING**: Local/mock data for tests

## 🎨 UI Development

### Component Guidelines
- Use TypeScript for all components
- Follow established design patterns
- Implement proper error boundaries
- Use Tailwind CSS for styling

### Component Structure
```tsx
// ComponentName.tsx
interface ComponentNameProps {
  // Define props here
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Component implementation
}

export default ComponentName
```

### Styling Standards
- **Tailwind CSS**: Primary styling framework
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliance
- **Performance**: Optimized images and lazy loading

## 🌐 API Development

### API Route Structure
```typescript
// src/app/api/example/route.ts
import { createSecuredHandler, SecurityConfigs } from '@/lib/middleware/api-security';

const handler = createSecuredHandler(
  async (request, context) => {
    // Handle request securely
    return NextResponse.json({ success: true });
  },
  {
    ...SecurityConfigs.user,
    validateSchema: exampleSchema,
    allowedMethods: ['POST']
  }
);

export const POST = handler;
```

### Security Configurations
- **Public**: 100 req/min, no auth required
- **User**: 60 req/min, JWT auth required
- **Admin**: 30 req/min, admin role required
- **Search**: 120 req/min, optimized for search
- **Write**: 20 req/min, CSRF protection enabled

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] All tests passing (security: 33/33)
- [ ] Production build successful
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] Security headers properly set

### Deployment Commands
```bash
# Verify production readiness
npm run build
npm run security:test

# Deploy to staging
git push origin staging

# Deploy to production (after staging verification)
git push origin main
```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Environment Variables Not Loading
```bash
# Check environment files
ls -la .env*

# Reset environment
npm run env:staging
npm run dev
```

#### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset if needed
npx prisma migrate reset
```

#### Build Failures
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check dependencies
npm install
npm audit fix
```

#### Port Already in Use (EADDRINUSE)
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
npm run dev -- -p 3002
```

## 📊 Development Metrics

### Success Criteria
- [ ] Health check returns all services as "up"
- [ ] Security tests pass (33/33)
- [ ] Build completes without errors
- [ ] No console errors in browser
- [ ] Authentication flow works
- [ ] Database operations successful

### Performance Targets
- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Security Score**: 10/10
- **Build Time**: < 60 seconds

## 🆘 Getting Help

### Quick Diagnostics
1. **Health Check**: `curl http://localhost:3001/api/health`
2. **Environment**: `npm run env:staging`
3. **Build Test**: `npm run build`
4. **Security Test**: `npm run security:test`

### Documentation Resources
- **Security**: <mcfile name="SECURITY.md" path="docs/SECURITY.md"></mcfile>
- **Deployment**: <mcfile name="DEPLOYMENT.md" path="docs/DEPLOYMENT.md"></mcfile>
- **Project Status**: <mcfile name="PROJECT_STATUS.md" path="docs/PROJECT_STATUS.md"></mcfile>
- **API Documentation**: <mcfile name="API_ENDPOINTS.md" path="docs/API_ENDPOINTS.md"></mcfile>

### Support Channels
- **GitHub Issues**: Create issue with appropriate labels
- **Security Issues**: Use `security` + `critical` labels
- **Documentation**: Check `/docs` directory

---

## 📋 Development Checklist

### Daily Startup
- [ ] Navigate to correct directory
- [ ] Check Git status and branch
- [ ] Set staging environment
- [ ] Start development server
- [ ] Verify health check

### Before Committing
- [ ] Run security tests
- [ ] Test production build
- [ ] Check for TypeScript errors
- [ ] Review changes for sensitive data
- [ ] Write clear commit message

### Weekly Maintenance
- [ ] Update dependencies
- [ ] Run full security audit
- [ ] Review and update documentation
- [ ] Check for performance issues
- [ ] Backup important data

---

**Last Updated**: Current Session  
**Project Status**: Production Ready ✅  
**Security Score**: 10/10 ⭐  
**Development Server**: http://localhost:3001