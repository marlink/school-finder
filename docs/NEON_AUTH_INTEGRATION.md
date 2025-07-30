# 🔐 Neon Auth Integration Guide

## 🎯 Overview

This guide covers integrating **Neon Auth** with your School Finder application, including connection pooling configuration and migration from Supabase Auth.

## 🏊‍♂️ Connection Pooling Configuration

### ✅ **Recommended Settings**
- **Connection Pooling**: ✅ **KEEP ENABLED**
- **Role**: `neondb_owner` (default)
- **Compute**: Primary (IDLE is fine for development)

### 🚀 **Why Connection Pooling?**
```
✅ Supports up to 10,000 concurrent connections
✅ Uses PgBouncer (industry standard)
✅ Perfect for Next.js serverless functions
✅ Prevents connection limit issues
✅ Recommended by Neon for most use cases
```

### ⚠️ **When to Disable Pooling**
Only use direct connection for:
- Database dumps (`pg_dump`)
- Session-dependent features
- Manual schema migrations

## 🔐 Neon Auth vs Current Setup

### **Current Setup (Supabase)**
```typescript
// Current auth with Supabase
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### **Neon Auth Benefits**
```
🎯 User data directly in your Neon database
🚀 No syncing between auth service and database
💰 No additional auth service costs
🔧 Ready-made UI components
📱 Google, GitHub, email/password support
```

## 🛠️ Integration Options

### **Option 1: Full Migration to Neon Auth**

#### 1. **Environment Configuration**
```bash
# .env.local (Neon Auth)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEON_DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Neon Auth Configuration
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (same as current)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

#### 2. **Update Prisma Schema**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js required tables
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  
  // School Finder specific fields
  role          String    @default("user")
  preferences   Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Your existing School model
model School {
  id          String   @id @default(cuid())
  name        String
  address     String
  city        String
  region      String
  latitude    Float?
  longitude   Float?
  website     String?
  phone       String?
  email       String?
  type        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### 3. **NextAuth Configuration**
```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
}
```

### **Option 2: Hybrid Approach (Recommended)**

Keep Supabase Auth but migrate database to Neon:

```typescript
// Use Neon for database, Supabase for auth
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

## 🚀 Migration Steps

### **Step 1: Database Migration**
```bash
# 1. Export current Supabase data
npx supabase db dump --file backup.sql

# 2. Update DATABASE_URL to Neon
# 3. Run Prisma migrations
npx prisma migrate dev --name init

# 4. Import data to Neon
psql $DATABASE_URL < backup.sql
```

### **Step 2: Update GitHub Actions**
```yaml
# .github/workflows/neon-branch-workflow.yml
env:
  DATABASE_URL: ${{ secrets.NEON_DATABASE_URL }}
  NEON_API_KEY: ${{ secrets.NEON_API_KEY }}
  NEON_PROJECT_ID: ${{ vars.NEON_PROJECT_ID }}
```

### **Step 3: Test Authentication**
```typescript
// Test auth integration
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  return Response.json({ user: session.user })
}
```

## 🔧 Connection String Examples

### **Development (with pooling)**
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```

### **Production (with pooling)**
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10
```

### **Direct connection (migrations only)**
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 📊 Performance Comparison

| Feature | Supabase Auth | Neon Auth |
|---------|---------------|-----------|
| **Setup Time** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Integration** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Flexibility** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 Recommendation

### **For Your School Finder App:**

1. **Keep connection pooling ON** ✅
2. **Start with hybrid approach**: Neon database + current auth
3. **Migrate to Neon Auth** when you need tighter integration
4. **Use the GitHub Actions workflows** we created for automated branching

### **Immediate Next Steps:**
1. ✅ Enable connection pooling in Neon
2. ✅ Update DATABASE_URL to use pooled connection
3. ✅ Test the connection with your app
4. 📋 Plan auth migration for next sprint

## 🔍 Testing Your Setup

```bash
# Test database connection
npm run db:test

# Test auth flow
npm run dev
# Navigate to /api/auth/signin

# Test with pooling
psql "$DATABASE_URL" -c "SELECT version();"
```

---

**🎉 With Neon's connection pooling and auth, your School Finder app will be ready for production scale!**