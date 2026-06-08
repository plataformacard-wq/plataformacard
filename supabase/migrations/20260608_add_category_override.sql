-- Migration: Add category_id to organization_product_overrides
ALTER TABLE public.organization_product_overrides 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.organization_product_overrides.category_id IS 'Override de categoria definido pelo franqueado para o produto herdado';
