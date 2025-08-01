## 🎯 STAGING DATABASE SETUP INSTRUCTIONS

### **Current Status:**
✅ Staging environment configured  
✅ Supabase project connected  
✅ Environment files properly set up
❌ Schools table needs to be created  

### **📋 MANUAL STEPS REQUIRED:**

#### **1. Create Schools Table**
Go to your Supabase dashboard and create the schools table:

🔗 **Dashboard URL:** Go to your Supabase project dashboard → SQL Editor

**Table Name:** `schools`

**Columns to Add:**
```sql
-- Copy this SQL and run it in SQL Editor (easier option)
CREATE TABLE public.schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  student_count INTEGER,
  teacher_count INTEGER,
  established_year INTEGER,
  school_type VARCHAR(100),
  languages TEXT[],
  specializations TEXT[],
  facilities TEXT[],
  image_url VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. Environment Setup**
Ensure you have the correct staging environment:

```bash
# Switch to staging environment
npm run env:staging

# Verify environment
cat .env.local | grep NEXT_PUBLIC_SUPABASE_URL
# Should show your staging Supabase URL
```

#### **3. Install Dependencies & Setup**
```bash
# Install dependencies
npm install

# Generate Prisma client (if using Prisma)
npx prisma generate

# Start development server
npm run dev
```

#### **4. Populate Database**
After table creation, run this command to populate with real school data:
```bash
cd /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder-production
node scripts/populate-real-schools-only.js
```

#### **5. Verify Setup**
```bash
node scripts/check-staging-data.js
```

### **🚀 NEXT STEPS AFTER TABLE CREATION:**
1. ✅ Environment properly configured
2. ❌ Populate with 18 real Polish schools
3. ❌ Test the application with real data
4. ❌ Update schema if needed
5. ❌ Push changes to GitHub
6. ❌ Set up deployment pipeline

**Ready to proceed once you've created the schools table!** 🎯