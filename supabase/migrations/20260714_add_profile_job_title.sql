-- Add job_title to profiles for the public card subtitle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
