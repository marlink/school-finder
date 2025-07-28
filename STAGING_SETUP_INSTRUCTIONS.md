## 🎯 STAGING DATABASE SETUP INSTRUCTIONS

### **Current Status:**
✅ Staging environment configured  
✅ Supabase project connected  
❌ Schools table needs to be created  

### **📋 MANUAL STEPS REQUIRED:**

#### **1. Create Schools Table**
Go to your Supabase dashboard and create the schools table:

🔗 **Dashboard URL:** https://supabase.com/dashboard/project/xhcltxeknhsvxzvvcjlp/editor

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

**OR manually in Table Editor:**
- `id` (int8, primary key) - auto-created
- `name` (text, required)
- `address` (text)
- `city` (text)
- `postal_code` (text)
- `phone` (text)
- `email` (text)
- `website` (text)
- `latitude` (numeric)
- `longitude` (numeric)
- `student_count` (int4)
- `teacher_count` (int4)
- `established_year` (int4)
- `school_type` (text)
- `languages` (text[])
- `specializations` (text[])
- `facilities` (text[])
- `image_url` (text)
- `description` (text)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

#### **2. After Table Creation**
Run this command to populate with real school data:
```bash
cd /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder-production
node scripts/populate-real-schools-only.js
```

#### **3. Verify Setup**
```bash
node scripts/check-staging-data.js
```

### **🚀 NEXT STEPS AFTER TABLE CREATION:**
1. Populate with 18 real Polish schools
2. Test the application with real data
3. Update schema if needed
4. Push changes to GitHub
5. Set up deployment pipeline

**Ready to proceed once you've created the schools table!** 🎯