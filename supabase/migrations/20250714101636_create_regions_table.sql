-- Create regions table
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- Add indexes
CREATE INDEX idx_regions_name ON regions(name);