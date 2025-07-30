# 🚀 GitHub Actions Workflows for Marlink School Finder

This directory contains comprehensive GitHub Actions workflows designed specifically for the **Marlink organization** to streamline development, ensure quality, and enhance team collaboration.

## 📁 Workflow Files

### 🔄 Core Development Workflows

#### 1. `neon-branch-workflow.yml` - Database Branching
**Purpose**: Automated database branch management with Neon for isolated testing environments.

**Triggers**:
- Pull request opened/reopened/synchronized
- Pull request closed

**Features**:
- ✅ Creates isolated database branches for each PR
- ✅ Runs schema migrations automatically
- ✅ Seeds database with test data
- ✅ Posts schema diff comments to PRs
- ✅ Cleans up database branches when PRs close
- ✅ Runs tests against PR-specific database

#### 2. `ci-cd.yml` - Continuous Integration & Deployment
**Purpose**: Comprehensive CI/CD pipeline with multi-environment support.

**Triggers**:
- Push to `main`, `staging`, `production-ready` branches
- Pull requests to `main`, `staging`
- Manual workflow dispatch

**Features**:
- ✅ **Multi-Node Testing**: Tests on Node.js 18 & 20
- ✅ **Enhanced Caching**: Prisma and npm cache optimization
- ✅ **Code Quality**: ESLint, TypeScript checks, test coverage
- ✅ **E2E Testing**: Playwright tests with artifact uploads
- ✅ **Security Scanning**: npm audit + Snyk integration
- ✅ **Automated Deployments**: Staging and production deployments
- ✅ **Release Management**: Automatic release creation
- ✅ **Production Validation**: Post-deployment health checks

### 🏢 Organization-Specific Workflows

#### 3. `organization-maintenance.yml` - Automated Maintenance
**Purpose**: Daily maintenance tasks for the Marlink organization.

**Triggers**:
- Daily schedule (2 AM UTC)
- Manual workflow dispatch

**Features**:
- 📦 **Dependency Monitoring**: Checks for outdated packages
- 🔒 **Security Scanning**: Daily vulnerability assessments
- 🧹 **Branch Cleanup**: Removes merged branches and stale Neon branches
- 📊 **Team Notifications**: Daily organization reports
- 🎯 **Issue Creation**: Automated issues for maintenance tasks

#### 4. `team-collaboration.yml` - Team Workflow Automation
**Purpose**: Enhances team collaboration and code review processes.

**Triggers**:
- Pull request events (opened, ready for review)
- Issue events (opened, labeled)
- Pull request reviews

**Features**:
- 👥 **Smart Reviewer Assignment**: Auto-assigns reviewers based on file changes
- 🏷️ **Intelligent Labeling**: Auto-labels PRs and issues based on content
- 📏 **PR Size Warnings**: Alerts for large PRs with review suggestions
- 🎉 **Contributor Welcome**: Welcomes new contributors
- 🤖 **Auto-merge**: Merges approved PRs with `auto-merge` label
- 💬 **Review Automation**: Thanks reviewers and manages review flow

## Required Configuration

### Automatically Configured (via Neon GitHub Integration)
- `NEON_API_KEY` - Neon API key for database operations
- `NEON_PROJECT_ID` - Your Neon project identifier

### Optional Secrets (for enhanced features)
Add these in GitHub repository settings → Secrets and variables → Actions:

**For Vercel Deployment**:
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID  
- `VERCEL_PROJECT_ID` - Vercel project ID

## Workflow Permissions

The workflows use these permissions:
- `contents: read` - Read repository contents
- `pull-requests: write` - Post schema diff comments

## Branch Strategy Support

The workflows support this Git flow:
- `main` → Production environment
- `staging` → Staging environment  
- `production-ready` → Pre-production branch
- `feature/*` → Feature branches (get database branches)

## Schema Diff Comments

When you make database schema changes, the Neon schema diff action automatically posts PR comments showing:
- 📊 Database schema differences
- 🔄 Migration changes
- 📈 Impact analysis
- 🔍 SQL diff preview

This helps reviewers understand database changes without switching contexts.

## Getting Started

1. **Commit the workflows**:
   ```bash
   git add .github/
   git commit -m "Add GitHub Actions workflows for Neon integration"
   git push origin main
   ```

2. **Test with a PR**:
   - Create a feature branch
   - Make a small change (e.g., update README)
   - Open a pull request
   - Watch the workflow create a database branch
   - Check for automated comments

3. **Monitor workflow runs**:
   - Go to your repository → Actions tab
   - View workflow execution logs
   - Check for any configuration issues

## Troubleshooting

### Common Issues

**Database connection errors**:
- Verify `NEON_API_KEY` and `NEON_PROJECT_ID` are set
- Check Neon project permissions

**Build failures**:
- Ensure all dependencies are in `package.json`
- Check for environment-specific configurations

**Test failures**:
- Verify test database setup
- Check for missing environment variables

### Getting Help

- Check workflow logs in GitHub Actions tab
- Review Neon Console for database branch status
- Verify repository secrets configuration

## Workflow Files

- `neon-branch-workflow.yml` - Database branch management
- `ci-cd.yml` - Continuous integration pipeline

Both workflows are designed to work together seamlessly with your existing development process.