ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS protein_goal INTEGER,
ADD COLUMN IF NOT EXISTS carbs_goal INTEGER,
ADD COLUMN IF NOT EXISTS fats_goal INTEGER,
ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very-active'));
