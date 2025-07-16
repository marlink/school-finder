-- Create user_viewed_schools table
CREATE TABLE user_viewed_schools (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- Add indexes
CREATE INDEX idx_user_viewed_schools_user_id ON user_viewed_schools(user_id);
CREATE INDEX idx_user_viewed_schools_school_id ON user_viewed_schools(school_id);
CREATE INDEX idx_user_viewed_schools_viewed_at ON user_viewed_schools(viewed_at);