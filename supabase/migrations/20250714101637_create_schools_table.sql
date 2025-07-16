-- Create schools table
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  google_rating DECIMAL(2, 1),
  review_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_schools_region_id ON schools(region_id);
CREATE INDEX idx_schools_google_rating ON schools(google_rating);
CREATE INDEX idx_schools_name ON schools(name);
CREATE INDEX idx_schools_coordinates ON schools(latitude, longitude);