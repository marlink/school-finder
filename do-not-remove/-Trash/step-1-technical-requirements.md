# Core Tech Stack
| Component | Version/Configuration | Notes |
|:----------|:---------------------|:-------|

| Next.js | 14.2.0 (App Router, Edge Runtime) | Use `next.config.js` for edge functions and optimizations. |

| Shadcn UI | `@shadcn/ui@latest` (Radix UI + Tailwind CSS) | Use `npm create shadcn-ui@latest` for setup. |

| Authentication | next-auth@4.23.0 (OAuth2 with Firebase/Supabase as providers) | Configure providers in `lib/auth.ts`. |

| Backend | Vercel (Edge Functions, Serverless API Routes) | Use `vercel.json` for edge function routing. |

| Database | PlanetScale (serverless MySQL) or DynamoDB (AWS) | Use Prisma or direct SQL for PlanetScale. |

| Maps | Google Maps React (`@react-google-maps/api@2.2.4`) | Require `GOOGLE_MAPS_API_KEY` (from Google Cloud Console). |

| Scraping | Apify Actors (`apify@2.0.0`) + Vercel Serverless Function | Use `apify-cli` for local testing, deploy to Apify Cloud. |

| Environment | `.env.local` (for secrets: `APIFY_API_TOKEN`, `GOOGLE_MAPS_API_KEY`, `NEXTAUTH_SECRET`) | Ensure `.gitignore` excludes `.env.local`. |