-- Create user_onboarding_status table
CREATE TABLE IF NOT EXISTS user_onboarding_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  welcome_tour_completed BOOLEAN DEFAULT FALSE,
  profile_setup_completed BOOLEAN DEFAULT FALSE,
  first_search_completed BOOLEAN DEFAULT FALSE,
  first_favorite_added BOOLEAN DEFAULT FALSE,
  email_preferences_set BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_onboarding_status_user_id ON user_onboarding_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_status_completed ON user_onboarding_status(onboarding_completed);

-- Enable RLS
ALTER TABLE user_onboarding_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own onboarding status" ON user_onboarding_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding status" ON user_onboarding_status
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding status" ON user_onboarding_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_onboarding_status_updated_at
  BEFORE UPDATE ON user_onboarding_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();