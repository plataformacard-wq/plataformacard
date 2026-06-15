-- Migration: Add out_of_stock_at_end column to catalogs table to allow pushing out-of-stock products to the end
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS out_of_stock_at_end BOOLEAN DEFAULT FALSE;

-- Reload schema cache to prevent "Could not find column in schema cache" errors
NOTIFY pgrst, 'reload schema';
