# School Finder Portal - Technical Requirements

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Core Tech Stack

### 1.1. Frontend Framework

| Component | Version/Configuration | Notes |
|:----------|:---------------------|:-------|
| **Next.js** | 15.4.1 (App Router, Edge Runtime) | Our primary framework that provides server-side rendering, static site generation, and API routes. The App Router architecture allows for more intuitive routing and better performance. |
| **Shadcn UI** | `@shadcn/ui@latest` (Radix UI + Tailwind CSS) | A collection of reusable components built on Radix UI primitives and styled with Tailwind CSS. This provides accessible, customizable UI components that maintain consistency throughout the application. |
| **State Management** | React Context API + SWR | For global state management, we'll use React's built-in Context API. For data fetching, caching, and revalidation, we'll use SWR (stale-while-revalidate) to ensure optimal user experience with real-time updates. |
| **Styling** | Tailwind CSS + CSS Modules | Tailwind for utility-first styling with CSS Modules for component-specific styles when needed. This combination provides flexibility while maintaining performance. |

### 1.2. Backend & Infrastructure

| Component | Version/Configuration | Notes |
|:----------|:---------------------|:-------|
| **Authentication** | Stack Auth (OAuth2 with Google/GitHub as providers) | Handles user authentication with multiple provider options. Stack Auth provides a complete authentication solution with built-in user management, permissions, and session handling. |
| **Backend** | Vercel (Edge Functions, Serverless API Routes) | Our serverless infrastructure that automatically scales based on demand. Edge Functions provide low-latency responses globally. |
| **Database** | Neon (serverless PostgreSQL with connection pooling) | Neon provides a serverless PostgreSQL database with automatic scaling, connection pooling via PgBouncer, and seamless Prisma integration. Connection pooling is enabled by default for optimal performance with Next.js serverless functions. |

### 1.3. External Services & Integrations

| Component | Version/Configuration | Notes |
|:----------|:---------------------|:-------|
| **Maps** | Google Maps React (`@react-google-maps/api@2.2.4`) | Provides interactive maps for school locations. Requires a valid API key from Google Cloud Console with proper restrictions. |
| **Scraping** | Apify Actors (`apify@2.0.0`) + Vercel Serverless Function | Handles data collection from educational websites. Apify Actors run in the cloud while our Vercel functions coordinate the process. |
| **Sentiment Analysis** | Natural.js or TensorFlow.js | For analyzing sentiment in school reviews and comments. Natural.js is lighter for basic analysis, while TensorFlow.js provides more advanced capabilities. |
| **Payment Processing** | Stripe API | Handles subscription payments for premium features with secure checkout and webhook integration. |

### 1.4. Environment & Security

| Component | Version/Configuration | Notes |
|:----------|:---------------------|:-------|
| **Environment** | `.env.local` | Stores all sensitive configuration values and API keys. Must be properly secured and never committed to version control. |
| **Required Secrets** | `APIFY_API_TOKEN`, `GOOGLE_MAPS_API_KEY`, `STACK_SECRET_SERVER_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Critical API keys and tokens that must be properly secured. |


## 2. Project Setup Instructions

### 2.1. Initial Project Setup

Before you begin working with the configuration files, follow these steps to set up your development environment:

1. **Create a new Next.js project**:
   ```bash
   # Create a new Next.js project with the app router
   npx create-next-app@latest school-finder --typescript --eslint --app
   cd school-finder
   ```

2. **Install required dependencies**:
   ```bash
   # Core dependencies
   npm install @stackframe/stack @react-google-maps/api@2.2.4 apify@2.0.0 swr
   
   # UI dependencies
   npm install @shadcn/ui@latest tailwindcss postcss autoprefixer
   
   # Database dependencies for Neon PostgreSQL
   npm install @prisma/client prisma
   
   # Payment processing
   npm install @stripe/stripe-js stripe
   
   # Sentiment analysis (choose one)
   npm install natural   # Lighter option
   # OR
   npm install @tensorflow/tfjs   # More advanced option
   ```

3. **Initialize Shadcn UI**:
   ```bash
   npx shadcn-ui@latest init
   ```
   When prompted, select:
   - Style: Default
   - Base color: Slate
   - CSS variables: Yes
   - Global CSS: Yes
   - React Server Components: Yes
   - Tailwind CSS: Yes
   - Components source: src/components
   - Utilities source: src/lib/utils

### 2.2. Configuration Files Setup

Follow these steps to set up the key configuration files for the project. Each file plays a critical role in the application's functionality.

#### 2.2.1. Create next.config.js

Create a file named `next.config.js` in the project root with the following content. This configuration enables experimental features and exposes environment variables to the client-side code:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for App Router and server components
  experimental: {
    appDir: true,
    serverComponents: true,
    serverActions: true,
  },
  // Expose specific environment variables to the client
  // IMPORTANT: Only expose variables that are safe for client-side use
  env: {
    APIFY_API_TOKEN: process.env.APIFY_API_TOKEN,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  // Image optimization configuration
  images: {
    domains: ['maps.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Configure redirects for better UX
  async redirects() {
    return [
      {
        source: '/schools',
        destination: '/search',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

#### 2.2.2. Set up Authentication

Create the directory structure `lib/` if it doesn't exist, then create the file `lib/stack.ts` with the following Stack Auth configuration. This handles user authentication with multiple providers:

```typescript
import { StackServerApp, StackClientApp } from '@stackframe/stack';

// Server-side Stack Auth configuration
export const stackServerApp = new StackServerApp({
  tokenStore: 'nextjs-cookie',
  urls: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
    afterSignOut: '/',
  },
});

// Client-side Stack Auth configuration
export const stackClientApp = new StackClientApp({
  tokenStore: 'cookie',
  baseUrl: process.env.NEXT_PUBLIC_STACK_URL,
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
});

// Authentication patterns for server-side usage
export async function requireAuth() {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Admin permission check
export async function requireAdmin() {
  const user = await requireAuth();
  if (!user.hasPermission('admin')) {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, subscriptionStatus: true }
        });
        
        token.role = userData?.role || 'user';
        token.subscriptionStatus = userData?.subscriptionStatus || 'free';
      }
      return token;
    },
  },
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Secret for encryption
  secret: process.env.NEXTAUTH_SECRET,
};

// Export the NextAuth handler
export default NextAuth(authOptions);
```

#### 2.2.3. Create Vercel Function for Scraping

Create the directory structure `pages/api/` if it doesn't exist, then create the file `pages/api/scrape.ts` with the following content. This serverless function interfaces with Apify for web scraping:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { Apify } from 'apify';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

// Rate limiting variables
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum requests per window

// In-memory store for rate limiting (replace with Redis in production)
const rateLimitStore: Record<string, { count: number, resetTime: number }> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    
    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Apply rate limiting
    const now = Date.now();
    const userRateLimit = rateLimitStore[userId] || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    
    // Reset count if window has expired
    if (now > userRateLimit.resetTime) {
      userRateLimit.count = 0;
      userRateLimit.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    // Check if user has exceeded rate limit
    if (userRateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        resetTime: userRateLimit.resetTime 
      });
    }
    
    // Increment request count
    userRateLimit.count++;
    rateLimitStore[userId] = userRateLimit;
    
    // Extract request parameters
    const { actorId, input } = req.body;
    
    // Validate required parameters
    if (!actorId || !input) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Initialize Apify client
    const client = new Apify.Client({ token: process.env.APIFY_API_TOKEN });
    
    // Start the actor run
    const run = await client.runs.create({ actorId, input });
    
    // Log the scraping request
    await prisma.scrapingLog.create({
      data: {
        userId,
        actorId,
        runId: run.id,
        status: 'started',
        input: JSON.stringify(input),
      },
    });
    
    // Return the run ID
    return res.status(200).json({ runId: run.id });
  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

#### 2.2.4. Set up Environment Variables

Create a `.env.local` file in the project root with the following variables. This file contains all the sensitive configuration that should never be committed to version control:

```
# Base URL for NextAuth
NEXTAUTH_URL=http://localhost:3000

# Secret for NextAuth encryption (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth credentials (from GitHub Developer settings)
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret

# Google Maps API key (from Google Cloud Console)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Apify API token (from Apify Console)
APIFY_API_TOKEN=your-apify-api-token

# Stripe API keys (from Stripe Dashboard)
STRIPE_PUBLIC_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Database connection strings (for Neon PostgreSQL)
# Pooled connection for application use (recommended for serverless)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?pgbouncer=true&connect_timeout=10"
# Direct connection for migrations and specific operations
DIRECT_DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"

# Admin credentials
ADMIN_EMAIL=neatgroupnet@gmail.com
# ADMIN_PASSWORD should be securely hashed before storage

# Rate limiting (optional, can be adjusted)
RATE_LIMIT_WINDOW=3600000  # 1 hour in milliseconds
MAX_REQUESTS_PER_WINDOW=5  # Maximum requests per window
```

> **IMPORTANT**: Never commit the `.env.local` file to version control. Make sure it's included in your `.gitignore` file.

### 2.3. Implementation Details

#### 2.3.1. User Search Limits Implementation

The School Finder Portal implements a tiered search limit system to encourage user registration and premium subscriptions. Here's how to implement this feature:

##### Non-Logged-In Users (Session Storage)

1. **Create a client-side search counter utility**:
   ```typescript
   // src/lib/searchLimits.ts
   
   const SEARCH_LIMIT_KEY = 'school_finder_search_count';
   const SEARCH_TIMESTAMP_KEY = 'school_finder_search_timestamp';
   const FREE_SEARCH_LIMIT = 3;
   
   export const getSearchCount = (): number => {
     if (typeof window === 'undefined') return 0;
     
     // Check if 24 hours have passed since the last reset
     const lastTimestamp = localStorage.getItem(SEARCH_TIMESTAMP_KEY);
     if (lastTimestamp) {
       const lastTime = parseInt(lastTimestamp, 10);
       const now = Date.now();
       const hoursPassed = (now - lastTime) / (1000 * 60 * 60);
       
       // Reset counter if 24 hours have passed
       if (hoursPassed >= 24) {
         localStorage.setItem(SEARCH_COUNT_KEY, '0');
         localStorage.setItem(SEARCH_TIMESTAMP_KEY, now.toString());
       }
     } else {
       // Initialize timestamp if not set
       localStorage.setItem(SEARCH_TIMESTAMP_KEY, Date.now().toString());
     }
     
     // Get current count
     const count = localStorage.getItem(SEARCH_LIMIT_KEY);
     return count ? parseInt(count, 10) : 0;
   };
   
   export const incrementSearchCount = (): number => {
     if (typeof window === 'undefined') return 0;
     
     const currentCount = getSearchCount();
     const newCount = currentCount + 1;
     localStorage.setItem(SEARCH_LIMIT_KEY, newCount.toString());
     return newCount;
   };
   
   export const hasReachedSearchLimit = (): boolean => {
     return getSearchCount() >= FREE_SEARCH_LIMIT;
   };
   
   export const getSearchesRemaining = (): number => {
     return Math.max(0, FREE_SEARCH_LIMIT - getSearchCount());
   };
   ```

2. **Implement search limit UI components**:
   ```tsx
   // src/components/SearchLimitAlert.tsx
   import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
   import { Button } from "@/components/ui/button";
   import { getSearchesRemaining } from "@/lib/searchLimits";
   import { signIn } from "next-auth/react";
   
   export function SearchLimitAlert() {
     const remaining = getSearchesRemaining();
     
     if (remaining > 1) return null;
     
     return (
       <Alert variant={remaining === 0 ? "destructive" : "warning"}>
         <AlertTitle>
           {remaining === 0 ? "Search limit reached" : "Almost at search limit"}
         </AlertTitle>
         <AlertDescription className="flex flex-col gap-2">
           <p>
             {remaining === 0
               ? "You've reached the limit of free searches. Sign in to continue searching."
               : `You have ${remaining} free ${remaining === 1 ? 'search' : 'searches'} remaining. Create an account to get more searches.`}
           </p>
           <Button 
             variant="outline" 
             className="w-fit" 
             onClick={() => signIn()}
           >
             Sign in
           </Button>
         </AlertDescription>
       </Alert>
     );
   }
   ```

##### Logged-In Users (Database Tracking)

1. **Create the database schema**:
   ```sql
   -- For Neon PostgreSQL
   CREATE TABLE user_searches (
     user_id VARCHAR(255) NOT NULL,
     search_count INT DEFAULT 0,
     last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (user_id)
   );
   
   -- Add index for faster queries
   CREATE INDEX idx_user_searches_last_reset ON user_searches(last_reset);
   ```

   Or with Prisma:
   ```prisma
   // prisma/schema.prisma
   model UserSearches {
     userId      String   @id @map("user_id")
     searchCount Int      @default(0) @map("search_count")
     lastReset   DateTime @default(now()) @map("last_reset")
     user        User     @relation(fields: [userId], references: [id])
     
     @@index([lastReset])
     @@map("user_searches")
   }
   ```

2. **Create a server-side API for tracking searches**:
   ```typescript
   // pages/api/track-search.ts
   import { NextApiRequest, NextApiResponse } from 'next';
   import { getServerSession } from 'next-auth/next';
   import { authOptions } from '@/lib/auth';
   import { prisma } from '@/lib/prisma';
   
   // Search limits based on subscription status
   const SEARCH_LIMITS = {
     free: 10,      // Free users get 10 searches per day
     premium: 100,  // Premium users get 100 searches per day
   };
   
   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     // Get user session
     const session = await getServerSession(req, res, authOptions);
     if (!session?.user?.id) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     
     const userId = session.user.id;
     const subscriptionStatus = session.user.subscriptionStatus || 'free';
     const searchLimit = SEARCH_LIMITS[subscriptionStatus] || SEARCH_LIMITS.free;
     
     try {
       // Get or create user search record
       let userSearch = await prisma.userSearches.findUnique({
         where: { userId },
       });
       
       // Check if we need to reset the counter (24 hours passed)
       const now = new Date();
       if (userSearch) {
         const hoursPassed = (now.getTime() - userSearch.lastReset.getTime()) / (1000 * 60 * 60);
         if (hoursPassed >= 24) {
           // Reset counter if 24 hours have passed
           userSearch = await prisma.userSearches.update({
             where: { userId },
             data: { searchCount: 1, lastReset: now },
           });
         } else {
           // Increment counter
           userSearch = await prisma.userSearches.update({
             where: { userId },
             data: { searchCount: { increment: 1 } },
           });
         }
       } else {
         // Create new record
         userSearch = await prisma.userSearches.create({
           data: { userId, searchCount: 1, lastReset: now },
         });
       }
       
       // Check if user has reached their limit
       const hasReachedLimit = userSearch.searchCount > searchLimit;
       
       return res.status(200).json({
         searchCount: userSearch.searchCount,
         limit: searchLimit,
         remaining: Math.max(0, searchLimit - userSearch.searchCount),
         hasReachedLimit,
       });
     } catch (error) {
       console.error('Error tracking search:', error);
       return res.status(500).json({ error: 'Internal server error' });
     }
   }
   ```

3. **Create a scheduled job to reset search counts**:
   ```typescript
   // pages/api/cron/reset-search-counts.ts
   import { NextApiRequest, NextApiResponse } from 'next';
   import { prisma } from '@/lib/prisma';
   
   // This endpoint should be called by a cron job (e.g., Vercel Cron)
   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     // Verify the request is authorized (e.g., using a secret header)
     const cronSecret = req.headers['x-cron-secret'];
     if (cronSecret !== process.env.CRON_SECRET) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     
     try {
       // Reset search counts for records older than 24 hours
       const yesterday = new Date();
       yesterday.setHours(yesterday.getHours() - 24);
       
       const result = await prisma.userSearches.updateMany({
         where: { lastReset: { lt: yesterday } },
         data: { searchCount: 0, lastReset: new Date() },
       });
       
       return res.status(200).json({
         success: true,
         recordsReset: result.count,
       });
     } catch (error) {
       console.error('Error resetting search counts:', error);
       return res.status(500).json({ error: 'Internal server error' });
     }
   }
   ```

#### 2.3.2. Stripe Integration for Subscriptions

The subscription model allows users to upgrade to a premium plan for additional features. Here's how to implement Stripe integration:

##### 1. Stripe Setup

1. **Install dependencies**:
   ```bash
   npm install @stripe/stripe-js stripe micro raw-body
   ```

2. **Create Stripe products and prices**:
   - Log in to the [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navigate to Products > Create Product
   - Create two products:
     - **Free Plan**: Price $0/month
     - **Premium Plan**: Price $9.99/month (or your desired price)
   - Note the Price IDs for each plan (e.g., `price_1234567890`)

##### 2. Client-Side Implementation

1. **Create a subscription page component**:
   ```tsx
   // src/app/subscription/page.tsx
   'use client';
   
   import { useState } from 'react';
   import { useSession } from 'next-auth/react';
   import { loadStripe } from '@stripe/stripe-js';
   import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
   import { Button } from '@/components/ui/button';
   import { CheckCircle } from 'lucide-react';
   
   // Initialize Stripe
   const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
   
   const plans = [
     {
       name: 'Free',
       price: '$0/month',
       priceId: 'free', // Not an actual Stripe price ID
       features: [
         '10 searches per day',
         'Basic school information',
         'Map view of schools',
       ],
       buttonText: 'Current Plan',
       disabled: true,
     },
     {
       name: 'Premium',
       price: '$9.99/month',
       priceId: 'price_1234567890', // Replace with your actual Stripe price ID
       features: [
         '100 searches per day',
         'Advanced filtering options',
         'School comparison tool',
         'Favorite schools',
         'Detailed analytics',
       ],
       buttonText: 'Upgrade Now',
       disabled: false,
     },
   ];
   
   export default function SubscriptionPage() {
     const { data: session } = useSession();
     const [loading, setLoading] = useState<string | null>(null);
     
     const handleSubscribe = async (priceId: string) => {
       if (!session?.user) {
         // Redirect to login if not logged in
         return;
       }
       
       if (priceId === 'free') {
         // Free plan doesn't need Stripe checkout
         return;
       }
       
       setLoading(priceId);
       
       try {
         // Create checkout session
         const response = await fetch('/api/create-checkout-session', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ priceId }),
         });
         
         const { sessionId } = await response.json();
         
         // Redirect to Stripe Checkout
         const stripe = await stripePromise;
         await stripe?.redirectToCheckout({ sessionId });
       } catch (error) {
         console.error('Error creating checkout session:', error);
       } finally {
         setLoading(null);
       }
     };
     
     return (
       <div className="container max-w-5xl py-10">
         <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Plan</h1>
         
         <div className="grid md:grid-cols-2 gap-8">
           {plans.map((plan) => (
             <Card key={plan.name} className="flex flex-col">
               <CardHeader>
                 <CardTitle className="text-2xl">{plan.name}</CardTitle>
                 <CardDescription className="text-xl font-bold">{plan.price}</CardDescription>
               </CardHeader>
               <CardContent className="flex-grow">
                 <ul className="space-y-2">
                   {plan.features.map((feature) => (
                     <li key={feature} className="flex items-start gap-2">
                       <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                       <span>{feature}</span>
                     </li>
                   ))}
                 </ul>
               </CardContent>
               <CardFooter>
                 <Button
                   className="w-full"
                   onClick={() => handleSubscribe(plan.priceId)}
                   disabled={plan.disabled || loading === plan.priceId}
                 >
                   {loading === plan.priceId ? 'Loading...' : plan.buttonText}
                 </Button>
               </CardFooter>
             </Card>
           ))}
         </div>
       </div>
     );
   }
   ```

##### 3. Server-Side Implementation

1. **Create a checkout session API endpoint**:
   ```typescript
   // pages/api/create-checkout-session.ts
   import { NextApiRequest, NextApiResponse } from 'next';
   import Stripe from 'stripe';
   import { getServerSession } from 'next-auth/next';
   import { authOptions } from '@/lib/auth';
   
   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     // Get user session
     const session = await getServerSession(req, res, authOptions);
     if (!session?.user?.id) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     
     try {
       const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
         apiVersion: '2023-10-16', // Use the latest API version
       });
       
       const { priceId } = req.body;
       
       // Create Stripe checkout session
       const checkoutSession = await stripe.checkout.sessions.create({
         payment_method_types: ['card'],
         line_items: [{
           price: priceId,
           quantity: 1,
         }],
         mode: 'subscription',
         success_url: `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
         cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`,
         metadata: {
           userId: session.user.id,
         },
         customer_email: session.user.email || undefined,
       });
       
       return res.status(200).json({ sessionId: checkoutSession.id });
     } catch (error) {
       console.error('Error creating checkout session:', error);
       return res.status(500).json({ error: 'Failed to create checkout session' });
     }
   }
   ```

2. **Create a webhook handler for Stripe events**:
   ```typescript
   // pages/api/webhooks/stripe.ts
   import { NextApiRequest, NextApiResponse } from 'next';
   import Stripe from 'stripe';
   import { buffer } from 'micro';
   import { prisma } from '@/lib/prisma';
   
   // Disable body parsing, need raw body for Stripe signature verification
   export const config = {
     api: {
       bodyParser: false,
     },
   };
   
   export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
       apiVersion: '2023-10-16',
     });
     
     const signature = req.headers['stripe-signature'] as string;
     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
     
     try {
       // Get raw body
       const rawBody = await buffer(req);
       
       // Verify webhook signature
       const event = stripe.webhooks.constructEvent(
         rawBody,
         signature,
         webhookSecret
       );
       
       // Handle different event types
       switch (event.type) {
         case 'checkout.session.completed': {
           const session = event.data.object as Stripe.Checkout.Session;
           const userId = session.metadata?.userId;
           
           if (userId && session.subscription) {
             // Update user subscription status
             await prisma.user.update({
               where: { id: userId },
               data: {
                 subscriptionStatus: 'premium',
                 subscriptionId: session.subscription as string,
               },
             });
             
             // Log subscription event
             await prisma.subscriptionLog.create({
               data: {
                 userId,
                 event: 'subscription_created',
                 subscriptionId: session.subscription as string,
                 data: JSON.stringify(session),
               },
             });
           }
           break;
         }
         
         case 'customer.subscription.updated': {
           const subscription = event.data.object as Stripe.Subscription;
           const subscriptionId = subscription.id;
           
           // Find user with this subscription ID
           const user = await prisma.user.findFirst({
             where: { subscriptionId },
           });
           
           if (user) {
             // Update subscription status based on Stripe status
             const status = subscription.status === 'active' ? 'premium' : 'free';
             
             await prisma.user.update({
               where: { id: user.id },
               data: { subscriptionStatus: status },
             });
             
             // Log subscription update
             await prisma.subscriptionLog.create({
               data: {
                 userId: user.id,
                 event: 'subscription_updated',
                 subscriptionId,
                 data: JSON.stringify(subscription),
               },
             });
           }
           break;
         }
         
         case 'customer.subscription.deleted': {
           const subscription = event.data.object as Stripe.Subscription;
           const subscriptionId = subscription.id;
           
           // Find user with this subscription ID
           const user = await prisma.user.findFirst({
             where: { subscriptionId },
           });
           
           if (user) {
             // Reset subscription status to free
             await prisma.user.update({
               where: { id: user.id },
               data: {
                 subscriptionStatus: 'free',
                 subscriptionId: null,
               },
             });
             
             // Log subscription deletion
             await prisma.subscriptionLog.create({
               data: {
                 userId: user.id,
                 event: 'subscription_deleted',
                 subscriptionId,
                 data: JSON.stringify(subscription),
               },
             });
           }
           break;
         }
       }
       
       return res.status(200).json({ received: true });
     } catch (error) {
       console.error('Webhook error:', error);
       return res.status(400).send(`Webhook Error: ${error.message}`);
     }
   }
   ```

3. **Create success and cancel pages**:
   ```tsx
   // src/app/subscription/success/page.tsx
   'use client';
   
   import { useEffect, useState } from 'react';
   import { useRouter, useSearchParams } from 'next/navigation';
   import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
   import { Button } from '@/components/ui/button';
   import { CheckCircle } from 'lucide-react';
   
   export default function SubscriptionSuccessPage() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     
     useEffect(() => {
       const verifySubscription = async () => {
         try {
           const sessionId = searchParams.get('session_id');
           if (!sessionId) {
             setError('Invalid session ID');
             setLoading(false);
             return;
           }
           
           // Verify the session with your backend
           const response = await fetch(`/api/verify-subscription?session_id=${sessionId}`);
           const data = await response.json();
           
           if (!data.success) {
             setError(data.error || 'Failed to verify subscription');
           }
         } catch (error) {
           console.error('Error verifying subscription:', error);
           setError('An error occurred while verifying your subscription');
         } finally {
           setLoading(false);
         }
       };
       
       verifySubscription();
     }, [searchParams]);
     
     return (
       <div className="container max-w-md py-10">
         <Card>
           <CardHeader>
             <CardTitle className="text-center text-2xl">
               {loading ? 'Processing...' : error ? 'Subscription Error' : 'Subscription Successful!'}
             </CardTitle>
           </CardHeader>
           <CardContent>
             {loading ? (
               <p className="text-center">Verifying your subscription...</p>
             ) : error ? (
               <p className="text-center text-red-500">{error}</p>
             ) : (
               <div className="flex flex-col items-center gap-4">
                 <CheckCircle className="h-16 w-16 text-green-500" />
                 <p className="text-center">
                   Thank you for subscribing to the Premium plan! Your account has been upgraded.
                 </p>
               </div>
             )}
           </CardContent>
           <CardFooter className="flex justify-center">
             <Button onClick={() => router.push('/dashboard')}>
               Go to Dashboard
             </Button>
           </CardFooter>
         </Card>
       </div>
     );
   }
   ```

## 3. Performance Optimization

### 3.1. Frontend Optimizations

#### 3.1.1. Next.js Edge Runtime

Deploy API routes as Edge Functions for global low-latency responses:

```typescript
// pages/api/schools/nearby.ts
export const config = {
  runtime: 'edge', // Mark this endpoint as an Edge Function
};

export default async function handler(req: Request) {
  // Parse the request URL to get query parameters
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5'; // Default 5km radius
  
  if (!lat || !lng) {
    return new Response(
      JSON.stringify({ error: 'Missing latitude or longitude parameters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // Fetch nearby schools from database
    // This is a simplified example - you would use your database client here
    const schools = await fetchNearbySchools(parseFloat(lat), parseFloat(lng), parseInt(radius));
    
    return new Response(
      JSON.stringify({ schools }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch nearby schools' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to fetch nearby schools
async function fetchNearbySchools(lat: number, lng: number, radius: number) {
  // Implementation depends on your database choice
  // For example, with Neon PostgreSQL:
  // SELECT *, 
  //   (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance 
  // FROM schools 
  // HAVING distance < ? 
  // ORDER BY distance
  
  // This is a placeholder - replace with actual implementation
  return [];
}
```

#### 3.1.2. Client-Side Data Fetching with SWR

Implement SWR for efficient data fetching with built-in caching, revalidation, and error handling:

```typescript
// src/hooks/useSchools.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNearbySchools(lat?: number, lng?: number, radius: number = 5) {
  const { data, error, isLoading, mutate } = useSWR(
    lat && lng ? `/api/schools/nearby?lat=${lat}&lng=${lng}&radius=${radius}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate when window gets focus
      revalidateOnReconnect: true, // Revalidate when browser regains connection
      refreshInterval: 0, // Don't poll for new data
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    }
  );

  return {
    schools: data?.schools || [],
    isLoading,
    isError: error,
    mutate, // Function to manually revalidate data
  };
}

export function useSchoolDetails(id?: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/schools/${id}` : null,
    fetcher
  );

  return {
    school: data?.school,
    isLoading,
    isError: error,
  };
}
```

Usage in a component:

```tsx
// src/app/schools/nearby/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useNearbySchools } from '@/hooks/useSchools';
import { SchoolCard } from '@/components/SchoolCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function NearbySchoolsPage() {
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const { schools, isLoading, isError } = useNearbySchools(location.lat, location.lng);
  
  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Schools Near You</h1>
      
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      )}
      
      {isError && (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          Error loading nearby schools. Please try again later.
        </div>
      )}
      
      {!isLoading && !isError && schools.length === 0 && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
          No schools found near your location. Try increasing the search radius.
        </div>
      )}
      
      {!isLoading && !isError && schools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 3.1.3. Image Optimization

Use Next.js Image component for automatic image optimization, lazy loading, and responsive images:

```tsx
// src/components/SchoolCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';

interface SchoolCardProps {
  school: {
    id: string;
    name: string;
    address: string;
    image: string;
    rating: number;
    type: string;
  };
}

export function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={school.image || '/images/school-placeholder.jpg'}
          alt={school.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={false} // Only set to true for above-the-fold images
          quality={80} // Adjust quality (default is 75)
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link href={`/schools/${school.id}`} className="hover:underline">
              {school.name}
            </Link>
          </CardTitle>
          <Badge variant="outline">{school.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{school.address}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.round(school.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="ml-2 text-sm font-medium">{school.rating.toFixed(1)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
```

#### 3.1.4. Code Splitting and Lazy Loading

Implement dynamic imports for code splitting to reduce initial bundle size:

```tsx
// src/app/schools/[id]/page.tsx
import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const SchoolMap = lazy(() => import('@/components/SchoolMap'));
const SentimentAnalysis = lazy(() => import('@/components/SentimentAnalysis'));

export default function SchoolDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8">
      {/* School details content */}
      
      {/* Lazy loaded map component */}
      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
        <SchoolMap schoolId={params.id} />
      </Suspense>
      
      {/* Lazy loaded sentiment analysis component */}
      <Suspense fallback={<Skeleton className="h-[200px] w-full rounded-lg mt-8" />}>
        <SentimentAnalysis schoolId={params.id} />
      </Suspense>
    </div>
  );
}
```

### 3.2. Backend Optimizations

#### 3.2.1. API Rate Limiting

Implement rate limiting for API routes to prevent abuse:

```typescript
// src/lib/rate-limit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

type RateLimitOptions = {
  limit: number;
  windowInSeconds: number;
};

export function withRateLimit(handler: any, options: RateLimitOptions) {
  return async function rateLimit(req: NextApiRequest, res: NextApiResponse) {
    // Get client IP or user ID if authenticated
    const session = await getServerSession(req, res, authOptions);
    const identifier = session?.user?.id || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Could not identify client' });
    }
    
    const key = `rate-limit:${identifier}:${req.url}`;
    
    try {
      // Get current count
      const current = await redis.get(key) as number || 0;
      
      // If count exceeds limit, return 429 Too Many Requests
      if (current >= options.limit) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
        });
      }
      
      // Increment count
      await redis.incr(key);
      
      // Set expiry if this is the first request in the window
      if (current === 0) {
        await redis.expire(key, options.windowInSeconds);
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', options.limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.limit - current - 1));
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Rate limiting error:', error);
      
      // If rate limiting fails, still allow the request to proceed
      return handler(req, res);
    }
  };
}

// Usage example
export const publicRateLimit = {
  limit: 60, // 60 requests
  windowInSeconds: 60, // per minute
};

export const authenticatedRateLimit = {
  limit: 200, // 200 requests
  windowInSeconds: 60, // per minute
};
```

Usage in an API route:

```typescript
// pages/api/schools/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit, publicRateLimit } from '@/lib/rate-limit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // API implementation
}

export default withRateLimit(handler, publicRateLimit);
```

#### 3.2.2. Database Query Optimization

Optimize database queries for better performance:

```typescript
// src/lib/db/schools.ts
import { prisma } from '@/lib/prisma';

export async function getSchoolsByLocation(lat: number, lng: number, radius: number = 5) {
  // Use a spatial query with an index for better performance
  // This example uses Prisma with Neon PostgreSQL
  
  // Calculate bounding box for initial filtering (faster than calculating distance for all records)
  const latDelta = radius / 111.32; // 1 degree latitude = 111.32 km
  const lngDelta = radius / (111.32 * Math.cos(lat * (Math.PI / 180)));
  
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;
  
  // First query: Get schools within the bounding box (uses indexes)
  const schoolsInBox = await prisma.school.findMany({
    where: {
      latitude: { gte: minLat, lte: maxLat },
      longitude: { gte: minLng, lte: maxLng },
    },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      image: true,
      type: true,
      // Only select needed fields to reduce data transfer
    },
  });
  
  // Second step: Calculate actual distances and filter by radius
  const schoolsWithDistance = schoolsInBox.map((school) => {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371; // Earth's radius in km
    const dLat = (school.latitude - lat) * (Math.PI / 180);
    const dLng = (school.longitude - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(school.latitude * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return {
      ...school,
      distance, // Add distance to each school
    };
  });
  
  // Filter schools by actual distance and sort by proximity
  return schoolsWithDistance
    .filter((school) => school.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}
```

#### 3.2.3. Caching Strategies

Implement server-side caching for frequently accessed data:

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
  try {
    // Try to get data from cache
    const cachedData = await redis.get(key);
    
    if (cachedData) {
      return cachedData as T;
    }
    
    // If not in cache, fetch fresh data
    const freshData = await fetchFn();
    
    // Store in cache with TTL
    await redis.set(key, freshData, { ex: ttlSeconds });
    
    return freshData;
  } catch (error) {
    console.error('Cache error:', error);
    // If cache fails, fall back to fetching fresh data
    return fetchFn();
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}
```

Usage in an API route:

```typescript
// pages/api/schools/popular.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCachedData } from '@/lib/cache';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const popularSchools = await getCachedData(
      'popular-schools',
      async () => {
        // This expensive query will only run when cache is empty
        return prisma.school.findMany({
          orderBy: { viewCount: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            address: true,
            image: true,
            rating: true,
            type: true,
          },
        });
      },
      // Cache for 1 hour
      3600
    );
    
    return res.status(200).json({ schools: popularSchools });
  } catch (error) {
    console.error('Error fetching popular schools:', error);
    return res.status(500).json({ error: 'Failed to fetch popular schools' });
  }
}

## 4. Data Update Implementation

### 4.1. Scheduled Data Updates

#### 4.1.1. Vercel Cron Job Setup

Create a `vercel.json` file in the project root to configure automatic data updates:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/update-school-data",
    "schedule": "0 1 * * *"  // Runs at 1:00 AM UTC every day
  }]
}
```

> **Note for Junior Developers**: The schedule uses cron syntax (minute hour day-of-month month day-of-week). The pattern `0 1 * * *` means "at minute 0 of hour 1 (1:00 AM) on any day of the month, any month, any day of the week".

#### 4.1.2. Update Handler Implementation

Create an API route that will be triggered by the Vercel Cron Job:

```typescript
// pages/api/update-school-data.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { scrapeSchoolData } from '@/lib/scraper';

// Helper functions (implement these in separate files for better organization)
import { validateStagingData } from '@/lib/data-validation';
import { backupProductionData } from '@/lib/data-backup';
import { swapStagingToProduction } from '@/lib/data-swap';
import { logDataUpdate } from '@/lib/data-logging';
import { sendAdminAlert } from '@/lib/notifications';
import { restoreFromBackup } from '@/lib/data-restore';

// For Vercel Cron Jobs, we need to verify the request is legitimate
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('Starting scheduled school data update...');
    
    // Step 1: Fetch new data (you might already have this in staging)
    // If you need to fetch fresh data, uncomment this:
    // const newData = await scrapeSchoolData();
    // await storeDataToStaging(newData);
    
    // Step 2: Validate staging data
    console.log('Validating staging data...');
    const isValid = await validateStagingData();
    if (!isValid) {
      console.error('Staging data validation failed');
      await sendAdminAlert('Staging data validation failed');
      return res.status(500).json({ error: 'Validation failed' });
    }
    
    // Step 3: Backup current production data
    console.log('Creating backup of production data...');
    const backupId = await backupProductionData();
    console.log(`Backup created with ID: ${backupId}`);
    
    // Step 4: Swap staging to production
    console.log('Swapping staging data to production...');
    await swapStagingToProduction();
    
    // Step 5: Log the update
    console.log('Logging data update...');
    await logDataUpdate({
      status: 'success',
      backupId,
      timestamp: new Date(),
    });
    
    console.log('School data update completed successfully');
    return res.status(200).json({ 
      success: true,
      message: 'School data updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('School data update failed:', error);
    
    // Handle the error and restore from backup
    await handleUpdateError(error, res);
  }
}

// Helper function to handle update errors
async function handleUpdateError(error, res: NextApiResponse) {
  try {
    // Get the latest backup ID
    const latestBackup = await prisma.dataBackup.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    
    if (latestBackup) {
      console.log(`Attempting to restore from backup ID: ${latestBackup.id}`);
      // Restore from backup
      await restoreFromBackup(latestBackup.id);
      console.log('Restore completed successfully');
    } else {
      console.error('No backup found to restore from');
    }
    
    // Alert administrators
    await sendAdminAlert(`Data update failed: ${error.message}`);
    
    // Log the failed update
    await logDataUpdate({
      status: 'failed',
      error: error.message,
      timestamp: new Date(),
    });
    
    return res.status(500).json({ 
      error: 'Data update failed', 
      message: error.message,
      restored: !!latestBackup
    });
  } catch (restoreError) {
    console.error('Restore attempt failed:', restoreError);
    await sendAdminAlert(`CRITICAL: Data update failed and restore failed: ${restoreError.message}`);
    
    return res.status(500).json({ 
      error: 'Critical failure', 
      message: 'Data update failed and restore attempt failed',
      details: {
        updateError: error.message,
        restoreError: restoreError.message
      }
    });
  }
}
```

### 4.2. Data Management Implementation

Implement the helper functions used in the update handler:

#### 4.2.1. Data Validation

```typescript
// lib/data-validation.ts
import { prisma } from '@/lib/prisma';

export async function validateStagingData() {
  try {
    // Get all schools from staging
    const stagingSchools = await prisma.stagingSchool.findMany();
    
    // Check if we have data
    if (stagingSchools.length === 0) {
      console.error('Validation failed: No schools found in staging');
      return false;
    }
    
    // Validate each school record
    let invalidCount = 0;
    for (const school of stagingSchools) {
      // Check required fields
      if (!school.name || !school.address) {
        console.error(`Invalid school record: Missing name or address, ID: ${school.id}`);
        invalidCount++;
        continue;
      }
      
      // Validate coordinates
      if (
        typeof school.latitude !== 'number' || 
        typeof school.longitude !== 'number' ||
        school.latitude < -90 || 
        school.latitude > 90 ||
        school.longitude < -180 ||
        school.longitude > 180
      ) {
        console.error(`Invalid school record: Invalid coordinates, ID: ${school.id}`);
        invalidCount++;
        continue;
      }
      
      // Add more validation as needed
    }
    
    // If more than 10% of records are invalid, fail validation
    const invalidPercentage = (invalidCount / stagingSchools.length) * 100;
    if (invalidPercentage > 10) {
      console.error(`Validation failed: ${invalidPercentage.toFixed(2)}% of records are invalid`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating staging data:', error);
    return false;
  }
}
```

#### 4.2.2. Data Backup

```typescript
// lib/data-backup.ts
import { prisma } from '@/lib/prisma';

export async function backupProductionData() {
  try {
    // Get all schools from production
    const productionSchools = await prisma.school.findMany();
    
    // Create a backup record
    const backup = await prisma.dataBackup.create({
      data: {
        data: JSON.stringify(productionSchools),
        recordCount: productionSchools.length,
        createdAt: new Date(),
      },
    });
    
    console.log(`Created backup with ID ${backup.id} containing ${productionSchools.length} schools`);
    
    // Clean up old backups (keep only the last 5)
    const oldBackups = await prisma.dataBackup.findMany({
      orderBy: { createdAt: 'desc' },
      skip: 5, // Skip the 5 most recent backups
    });
    
    if (oldBackups.length > 0) {
      const oldBackupIds = oldBackups.map(backup => backup.id);
      await prisma.dataBackup.deleteMany({
        where: { id: { in: oldBackupIds } },
      });
      console.log(`Deleted ${oldBackups.length} old backups`);
    }
    
    return backup.id;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}
```

#### 4.2.3. Data Swap

```typescript
// lib/data-swap.ts
import { prisma } from '@/lib/prisma';

export async function swapStagingToProduction() {
  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Get all schools from staging
      const stagingSchools = await tx.stagingSchool.findMany();
      
      // Clear the production table
      await tx.school.deleteMany({});
      
      // Insert staging data into production
      for (const school of stagingSchools) {
        // Remove staging-specific fields
        const { id, createdAt, updatedAt, ...schoolData } = school;
        
        // Create new record in production
        await tx.school.create({
          data: {
            ...schoolData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
      
      console.log(`Moved ${stagingSchools.length} schools from staging to production`);
    });
    
    return true;
  } catch (error) {
    console.error('Error swapping staging to production:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}
```

#### 4.2.4. Data Restore

```typescript
// lib/data-restore.ts
import { prisma } from '@/lib/prisma';

export async function restoreFromBackup(backupId: string) {
  try {
    // Get the backup
    const backup = await prisma.dataBackup.findUnique({
      where: { id: backupId },
    });
    
    if (!backup) {
      throw new Error(`Backup with ID ${backupId} not found`);
    }
    
    // Parse the backup data
    const schools = JSON.parse(backup.data);
    
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Clear the production table
      await tx.school.deleteMany({});
      
      // Restore from backup
      for (const school of schools) {
        // Remove fields that might cause conflicts
        const { id, createdAt, updatedAt, ...schoolData } = school;
        
        // Create new record in production
        await tx.school.create({
          data: {
            ...schoolData,
            // Preserve original timestamps if possible
            createdAt: new Date(createdAt),
            updatedAt: new Date(), // Set current time as update time
          },
        });
      }
    });
    
    console.log(`Restored ${schools.length} schools from backup ID ${backupId}`);
    
    // Log the restore operation
    await prisma.dataUpdateLog.create({
      data: {
        operation: 'restore',
        details: `Restored from backup ID ${backupId}`,
        timestamp: new Date(),
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}
```

### 4.3. Manual Update Trigger

Create an admin-only API endpoint to manually trigger updates:

```typescript
// pages/api/admin/trigger-update.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Import the handler from the cron endpoint to reuse the logic
import updateHandler from '../update-school-data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Add the authorization header to simulate a cron job request
  req.headers.authorization = `Bearer ${process.env.CRON_SECRET}`;
  
  // Call the same handler used by the cron job
  return updateHandler(req, res);
}
```

### 4.4. Update Status Dashboard

Create a React component for administrators to view update history and trigger manual updates:

```tsx
// components/admin/DataUpdatePanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

interface UpdateLog {
  id: string;
  operation: string;
  status: string;
  details?: string;
  timestamp: string;
}

export function DataUpdatePanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [updateLogs, setUpdateLogs] = useState<UpdateLog[]>([]);
  
  // Fetch update logs
  const fetchUpdateLogs = async () => {
    try {
      const response = await fetch('/api/admin/update-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch update logs');
      }
      
      const data = await response.json();
      setUpdateLogs(data.logs);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Trigger manual update
  const triggerUpdate = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/trigger-update', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }
      
      toast({
        title: 'Success',
        description: 'School data update triggered successfully',
      });
      
      // Refresh logs after a short delay
      setTimeout(fetchUpdateLogs, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch logs on component mount
  useEffect(() => {
    fetchUpdateLogs();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>School Data Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updateLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No update logs found</TableCell>
              </TableRow>
            ) : (
              updateLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.operation}</TableCell>
                  <TableCell>
                    <span className={log.status === 'success' ? 'text-green-500' : 'text-red-500'}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell>{log.details || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button onClick={triggerUpdate} disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Trigger Manual Update'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## 5. Security Considerations

### 5.1. API Security

#### 5.1.1. API Rate Limiting

Implement rate limiting on all API endpoints to prevent abuse and protect against DDoS attacks:

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

type RateLimitOptions = {
  limit: number;      // Maximum number of requests
  windowMs: number;   // Time window in milliseconds
  identifier?: string; // Custom identifier (defaults to IP address)
};

export function withRateLimit(options: RateLimitOptions) {
  return async function rateLimit(req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) {
    // Get identifier (IP address by default)
    const identifier = options.identifier || getClientIp(req) || 'anonymous';
    
    // Create a unique key for this endpoint and identifier
    const endpoint = req.url?.replace(/\?.*$/, '') || req.url || 'unknown';
    const key = `rate-limit:${endpoint}:${identifier}`;
    
    // Get current count from Redis
    const currentCount = await redis.get(key) || 0;
    
    // Check if rate limit is exceeded
    if (currentCount >= options.limit) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
      });
    }
    
    // Increment count and set expiry if it's the first request
    if (currentCount === 0) {
      await redis.set(key, 1, { ex: Math.floor(options.windowMs / 1000) });
    } else {
      await redis.incr(key);
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', options.limit.toString());
    res.setHeader('X-RateLimit-Remaining', (options.limit - Number(currentCount) - 1).toString());
    
    // Continue to the actual handler
    await next();
  };
}

// Example usage in an API route
export async function applyRateLimit(req: NextApiRequest, res: NextApiResponse, options: RateLimitOptions) {
  return new Promise<boolean>((resolve) => {
    withRateLimit(options)(req, res, async () => {
      resolve(true);
    }).catch(() => {
      resolve(false);
    });
  });
}
```

Example usage in an API route:

```typescript
// pages/api/schools/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { applyRateLimit } from '@/lib/rate-limit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting - 10 requests per minute
  const rateLimitPassed = await applyRateLimit(req, res, {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  });
  
  if (!rateLimitPassed) {
    // Rate limit response is already sent by the middleware
    return;
  }
  
  // Your actual API logic here
  // ...
}
```

#### 5.1.2. Input Validation

Validate all user inputs on both client and server sides using a library like Zod:

```typescript
// lib/validation/school-search.ts
import { z } from 'zod';

// Define validation schema
export const SchoolSearchSchema = z.object({
  query: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(1).max(100).optional(),
  filters: z.object({
    schoolType: z.enum(['public', 'private', 'charter']).array().optional(),
    gradeLevel: z.enum(['elementary', 'middle', 'high']).array().optional(),
  }).optional(),
});

// Type for validated data
export type SchoolSearchParams = z.infer<typeof SchoolSearchSchema>;

// Validation function
export function validateSchoolSearch(data: unknown): {
  success: boolean;
  data?: SchoolSearchParams;
  error?: string;
} {
  try {
    const validated = SchoolSearchSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Invalid input data' };
  }
}
```

Example usage in an API route:

```typescript
// pages/api/schools/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateSchoolSearch } from '@/lib/validation/school-search';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Validate input
  const validation = validateSchoolSearch(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  
  // Proceed with validated data
  const { query, latitude, longitude, radius, filters } = validation.data;
  
  // Your API logic here
  // ...
}
```

### 5.2. Web Security

#### 5.2.1. CSRF Protection

Implement CSRF tokens for all form submissions using next-auth's built-in CSRF protection:

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

export default NextAuth(authOptions);
```

For forms not using next-auth, implement custom CSRF protection:

```typescript
// lib/csrf.ts
import { randomBytes } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';

// Generate a CSRF token
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// Set CSRF token in a cookie
export function setCsrfCookie(res: NextApiResponse): string {
  const token = generateCsrfToken();
  res.setHeader('Set-Cookie', serialize('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  }));
  return token;
}

// Verify CSRF token
export function verifyCsrfToken(req: NextApiRequest): boolean {
  const cookies = parse(req.headers.cookie || '');
  const cookieToken = cookies['csrf-token'];
  const bodyToken = req.body.csrfToken;
  
  if (!cookieToken || !bodyToken || cookieToken !== bodyToken) {
    return false;
  }
  
  return true;
}
```

Example usage in a form component:

```tsx
// components/ContactForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
  const [csrfToken, setCsrfToken] = useState('');
  
  // Fetch CSRF token on component mount
  useEffect(() => {
    async function fetchCsrfToken() {
      const response = await fetch('/api/csrf');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    }
    
    fetchCsrfToken();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('csrfToken', csrfToken);
    
    // Submit form data
    // ...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* Form fields */}
    </form>
  );
}
```

#### 5.2.2. Content Security Policy

Set up a strict Content Security Policy to prevent XSS attacks using the Next.js config:

```typescript
// next.config.js
const { createSecureHeaders } = require('next-secure-headers');

module.exports = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: createSecureHeaders({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https://maps.googleapis.com'],
            connectSrc: ["'self'", 'https://api.stripe.com'],
            frameSrc: ["'self'", 'https://js.stripe.com'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
          },
        },
        referrerPolicy: 'strict-origin-when-cross-origin',
      }),
    }];
  },
};
```

#### 5.2.3. Secure Headers

Configure secure HTTP headers using the `next-secure-headers` package:

```typescript
// next.config.js
const { createSecureHeaders } = require('next-secure-headers');

module.exports = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: createSecureHeaders({
        // Content-Security-Policy configured above
        
        // X-Frame-Options to prevent clickjacking
        xFrameOptions: 'DENY',
        
        // X-Content-Type-Options to prevent MIME type sniffing
        xContentTypeOptions: 'nosniff',
        
        // Strict-Transport-Security for HTTPS enforcement
        strictTransportSecurity: {
          maxAge: 63072000,
          includeSubDomains: true,
          preload: true,
        },
        
        // X-XSS-Protection as an additional layer of XSS protection
        xXssProtection: '1; mode=block',
        
        // Permissions Policy to control browser features
        permissionsPolicy: {
          camera: [],
          geolocation: ['self'],
          microphone: [],
        },
      }),
    }];
  },
};
```

### 5.3. Database Security

#### 5.3.1. Parameterized Queries

Use Prisma's built-in parameterized queries to prevent SQL injection:

```typescript
// lib/db/schools.ts
import { prisma } from '@/lib/prisma';

// GOOD: Using Prisma's parameterized queries
export async function getSchoolById(id: string) {
  return prisma.school.findUnique({
    where: { id },
  });
}

// BAD: Never do this - vulnerable to SQL injection
// export async function getSchoolByIdUnsafe(id: string) {
//   return prisma.$queryRaw`SELECT * FROM schools WHERE id = ${id}`;
// }
```

#### 5.3.2. Database Access Control

Implement proper database access control using Prisma middleware:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

// Add middleware for logging and access control
prisma.$use(async (params, next) => {
  // Log database operations in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Prisma ${params.model}.${params.action}`);
  }
  
  // Example of access control for sensitive operations
  if (params.model === 'User' && params.action === 'delete') {
    // Only allow in admin context
    const isAdmin = true; // Replace with actual admin check
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
  }
  
  return next(params);
});

export { prisma };
```

### 5.4. Authentication & Authorization

#### 5.4.1. Protected Routes

Implement proper authentication checks on all protected routes:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth',
    '/schools',
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check for admin paths
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin');
  
  // Get the token
  const token = await getToken({ req: request });
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access admin route but not an admin, redirect to dashboard
  if (isAdminPath && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/profile/:path*',
  ],
};
```

#### 5.4.2. Role-Based Access Control

Implement role-based access control for different user types:

```typescript
// lib/auth/permissions.ts
import { Session } from 'next-auth';

// Define permission types
export type Permission = 
  | 'view:schools'
  | 'create:review'
  | 'edit:review'
  | 'delete:review'
  | 'view:admin-dashboard'
  | 'manage:users'
  | 'manage:schools';

// Define role-permission mappings
const rolePermissions: Record<string, Permission[]> = {
  USER: [
    'view:schools',
    'create:review',
    'edit:review',
  ],
  PREMIUM_USER: [
    'view:schools',
    'create:review',
    'edit:review',
    'delete:review',
  ],
  ADMIN: [
    'view:schools',
    'create:review',
    'edit:review',
    'delete:review',
    'view:admin-dashboard',
    'manage:users',
    'manage:schools',
  ],
};

// Check if a user has a specific permission
export function hasPermission(session: Session | null, permission: Permission): boolean {
  if (!session || !session.user) {
    return false;
  }
  
  const role = session.user.role || 'USER';
  return rolePermissions[role]?.includes(permission) || false;
}

// React hook for checking permissions
export function usePermission(permission: Permission) {
  // This would use useSession from next-auth/react
  // const { data: session } = useSession();
  // return hasPermission(session, permission);
  
  // Placeholder implementation
  return true;
}
```

Example usage in a component:

```tsx
// components/AdminButton.tsx
'use client';

import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth/permissions';
import { Button } from '@/components/ui/button';

export function AdminButton() {
  const { data: session } = useSession();
  const canAccessAdmin = hasPermission(session, 'view:admin-dashboard');
  
  if (!canAccessAdmin) {
    return null;
  }
  
  return (
    <Button asChild>
      <a href="/admin">Admin Dashboard</a>
    </Button>
  );
}
```

### 5.5. Environment Variables

Store sensitive information in environment variables, never in the codebase:

```bash
# .env.local example (NEVER commit this file to version control)

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-chars

# Database
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?pgbouncer=true&connect_timeout=10

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
APIFY_API_KEY=your-apify-api-key

# Stripe
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Redis for rate limiting and caching
UPSTASH_REDIS_URL=your-upstash-redis-url
UPSTASH_REDIS_TOKEN=your-upstash-redis-token

# Cron job security
CRON_SECRET=your-cron-job-secret-key
```

Access environment variables in your code:

```typescript
// lib/config.ts
export const config = {
  auth: {
    url: process.env.NEXTAUTH_URL,
    secret: process.env.NEXTAUTH_SECRET,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  apis: {
    googleMaps: process.env.GOOGLE_MAPS_API_KEY,
    apify: process.env.APIFY_API_KEY,
  },
  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  redis: {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  },
  cron: {
    secret: process.env.CRON_SECRET,
  },
};

// Validate required environment variables
export function validateEnvVars() {
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'GOOGLE_MAPS_API_KEY',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
```
