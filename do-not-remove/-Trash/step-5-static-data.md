Data Update Mechanism: Static Data & Scheduled Overwrite
Key Requirement: Admin-scraped data will not directly overwrite live site content. Instead, updates will occur as a quiet background replacement during scheduled maintenance windows (e.g., nighttime).

Implementation Details
1. Static Data Storage
Temporary Storage:

Scraped data is stored in a static directory (e.g., static/school-data-backups/) or a dedicated database table marked as is_staging = true.
Live site content references the production dataset (e.g., school_data_production).
Example File Structure:

Bash

school-data/
  ├── production/
  │   ├── schools.json  
  │   └── comments.json  
  └── staging/
      ├── schools.json  
      └── comments.json  
2. Scheduled Nightly Replacement
Automation Tool:

Use Vercel Cron Jobs (serverless) or AWS Lambda@Edge to trigger a script at 1 AM local time.
Alternative: Supabase Scheduled Triggers.
Process Flow:

Scraping: Admin triggers a manual scrape (via Apify/Vercel function) and saves data to staging/.
Validation: System checks for errors (e.g., missing fields, duplicate entries).
Swap at Midnight:
Production references switch from production/ to staging/.
Old data in production/ is archived (e.g., archived-2024-07-10.json).
Cleanup: Remove stale staging data after 24 hours.
Example Script (scripts/update-data.js):

JavaScript

// Run via Vercel Cron
const fs = require('fs').promises;

export default async function () {
  const productionPath = './school-data/production/';
  const stagingPath = './school-data/staging/';

  // Copy staging to production
  await fs.rm(productionPath, { recursive: true, force: true });
  await fs.cp(stagingPath, productionPath, { recursive: true });

  // Log the update
  console.log("Data updated successfully at", new Date());
}
User Experience Considerations
No Disruption: Users interacting with the site during the update will always see the stable production data.
New Sessions After Update: Users visiting the site after midnight will see fresh data.
Fallback Mechanism:
If the scheduled job fails, retain production data and alert admins via email.
Retry the job 1 hour later.
Admin Interface Updates
Scraping Trigger:

Admin clicks "Scrape Data" → data saves to staging/ with a timestamp.
UI message: "Data scraped successfully! Next update: 1 AM tonight."
Manual Override:

Admin can force an immediate swap (with warning: "This will interrupt users online").
Edge Cases & Mitigations
Scraped Data Incompleteness

Scenario: Admin scrapes incomplete data (e.g., missing school addresses).
Mitigation: Validation step in the scheduled job blocks the swap if critical fields are missing.
High Traffic During Update

Scenario: Millions of users visit the site exactly at 1 AM.
Mitigation:
Synchronize swap time with regional peak hours (e.g., run at 2 AM in Poland).
Cache-first strategy: Serve old data from Vercel Edge cache for 5 minutes during the swap.
Large Data Volumes

Scenario: Scraped data is 10x larger than previous versions.
Mitigation:
Gradual rollout: Update 10% of users at a time.
Optimize JSON with gzip compression.
Technical Spec Additions
Component	Details
Data Staging	Separate folder/database table for staged data.
Scheduled Jobs	Vercel Cron Job running scripts/update-data.js nightly.
Fallbacks	Fallback to last known good dataset if swap fails.
Logging	Admin dashboard shows update history (success/failure times).
