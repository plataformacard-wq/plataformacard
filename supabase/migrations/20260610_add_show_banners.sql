-- Migration: Add show_banners column to catalogs table to allow hiding/showing the banners carousel
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS show_banners BOOLEAN DEFAULT TRUE;

-- Reload schema cache to prevent "Could not find column in schema cache" errors
NOTIFY pgrst, 'reload schema';
