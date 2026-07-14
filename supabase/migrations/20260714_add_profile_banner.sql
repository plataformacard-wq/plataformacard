-- Add public_banner_url to organizations (for B2B)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS public_banner_url TEXT;

-- Add public_banner_url to profiles (for B2C)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_banner_url TEXT;

-- Add icon_url to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_url TEXT;
