# 🚀 Staging Environment Setup

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/school_finder_staging"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="7X73ilWd6aC7PFHMpBoavLzM2iYdFhB2Zp07SxJx1Lo="
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="[YOUR_GOOGLE_MAPS_API_KEY_HERE]"
APIFY_API_TOKEN="[YOUR_APIFY_TOKEN_HERE]"

# OAuth (Development)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed Database:**
   ```bash
   npm run seed
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Notes

- Replace `[YOUR_APIFY_TOKEN_HERE]` with your actual Apify API token
- Update Google OAuth credentials for authentication
- Ensure PostgreSQL is running locally