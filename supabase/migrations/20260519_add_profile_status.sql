-- Add status column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add check constraint for valid status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_status_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'paused', 'terminated'));
    END IF;
END $$;
