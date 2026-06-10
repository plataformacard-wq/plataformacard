-- Migration: Add whatsapp column to organizations table
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(255);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
