# School Finder Project Setup Instructions

## 1. Configuration Files Setup

Follow these steps to set up the key configuration files for the project:

### 1.1. Create next.config.js

Create a file named `next.config.js` in the project root with the following content:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponents: true,
    serverActions: true,
  },
  env: {
    APIFY_API_TOKEN: process.env.APIFY_API_TOKEN,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
};

module.exports = nextConfig;
```

### 1.2. Set up Authentication

Create the file `lib/auth.ts` with the following NextAuth.js configuration:

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
```

### 1.3. Create Vercel Function for Scraping

Create the file `pages/api/scrape.ts` with the following content:

```typescript
import { Apify } from 'apify';

export default async function handler(req, res) {
  const { actorId, input } = req.body;
  const client = new Apify.Client({ token: process.env.APIFY_API_TOKEN });
  const run = await client.runs.create({ actorId, input });
  res.status(200).json({ runId: run.id });
}
```

### 1.4. Set up Environment Variables

Create a `.env.local` file in the project root with the following variables:

## 2. Performance Optimization

- **Edge Functions**: Use Vercel's Edge Runtime for low-latency APIs (e.g., map geocoding, scraping triggers).
- **Caching**: Cache frequent scrape results in PlanetScale or DynamoDB.
- **Shadcn UI**: Use @apply for CSS-in-JS to minimize bundle size.