-- Add university-specific fields to schools table
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS rspo VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS principal VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_info JSONB,
  ADD COLUMN IF NOT EXISTS location JSONB,
  ADD COLUMN IF NOT EXISTS google_place_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS photos JSONB,
  ADD COLUMN IF NOT EXISTS website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS founding_date DATE,
  ADD COLUMN IF NOT EXISTS students_count INTEGER,
  ADD COLUMN IF NOT EXISTS faculties JSONB,
  ADD COLUMN IF NOT EXISTS courses JSONB;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_schools_rspo ON schools(rspo);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_google_place_id ON schools(google_place_id);