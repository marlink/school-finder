-- Add database indexes to improve search performance
-- This script adds critical indexes for the School search functionality

-- Index for school name (text search)
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_schools_name_text ON schools (name);

-- Index for school type
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools (type);

-- Indexes for JSON address fields (most commonly searched)
CREATE INDEX IF NOT EXISTS idx_schools_address_city ON schools USING gin((address->'city'));
CREATE INDEX IF NOT EXISTS idx_schools_address_voivodeship ON schools USING gin((address->'voivodeship'));
CREATE INDEX IF NOT EXISTS idx_schools_address_district ON schools USING gin((address->'district'));

-- Indexes for numeric fields used in filtering
CREATE INDEX IF NOT EXISTS idx_schools_student_count ON schools (student_count);
CREATE INDEX IF NOT EXISTS idx_schools_established_year ON schools (established_year);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools (status);

-- Indexes for JSON array fields
CREATE INDEX IF NOT EXISTS idx_schools_languages ON schools USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_schools_specializations ON schools USING gin(specializations);
CREATE INDEX IF NOT EXISTS idx_schools_facilities ON schools USING gin(facilities);

-- Composite indexes for common search combinations
CREATE INDEX IF NOT EXISTS idx_schools_type_status ON schools (type, status);
CREATE INDEX IF NOT EXISTS idx_schools_name_type ON schools (name, type);

-- Index for location-based searches (if location data exists)
CREATE INDEX IF NOT EXISTS idx_schools_location ON schools USING gin(location);

-- Index for created_at (for sorting by newest)
CREATE INDEX IF NOT EXISTS idx_schools_created_at ON schools (created_at);

-- Analyze tables to update statistics
ANALYZE schools;
ANALYZE ratings_users;
ANALYZE ratings_google;
ANALYZE school_images;