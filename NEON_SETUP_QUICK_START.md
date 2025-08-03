# 🚀 Neon Setup Quick Start

## Current Status: ⏸️ PAUSED - Manual Setup Required

Your Neon deployment is blocked because these manual steps need to be completed:

## 🔧 **Step 1: Create Neon Account & Project**

1. **Go to [neon.tech](https://neon.tech)** and create an account
2. **Create new project:**
   - Project name: `school-finder`
   - Database name: `school_finder_db`
   - Region: `us-east-1` (or closest to your users)
3. **Note your Project ID** (you'll see it in the URL)

## 🌿 **Step 2: Create Database Branches**

1. **Main branch** (production) - automatically created
2. **Create staging branch:**
   - Go to Branches → Create Branch
   - Name: `staging`
   - Parent: `main`
3. **Create development branch:**
   - Go to Branches → Create Branch  
   - Name: `development`
   - Parent: `main`

## 🔑 **Step 3: Get Connection Strings**

For each branch, go to Dashboard → Connection Details:

1. **Production (main)**: Copy pooled connection string
2. **Staging**: Copy pooled connection string  
3. **Development**: Copy direct connection string

## 🔐 **Step 4: Configure GitHub Secrets**

In your GitHub repository settings:

1. **Go to Settings → Secrets and variables → Actions**
2. **Add Repository Secret:**
   - Name: `NEON_API_KEY`
   - Value: [Get from Neon Console → Account Settings → API Keys]
3. **Add Repository Variable:**
   - Name: `NEON_PROJECT_ID`
   - Value: [Your project ID from Step 1]

## ⚡ **Step 5: Complete Setup**

Once you have the connection strings, run:

```bash
# Create environment files with your actual connection strings
./scripts/complete-neon-setup.sh
```

## 🎯 **What This Fixes:**

- ✅ Enables GitHub Actions workflows for database branching
- ✅ Allows automatic PR database creation/deletion
- ✅ Enables production deployment to Vercel with Neon
- ✅ Sets up proper environment separation

## 🆘 **Need Help?**

If you get stuck on any step, let me know and I can:
- Help troubleshoot connection issues
- Create the environment files manually
- Guide you through the GitHub secrets setup