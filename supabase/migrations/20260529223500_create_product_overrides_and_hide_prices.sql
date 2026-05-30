-- Migration: Create Product Overrides and add hide_prices to catalogs

-- 1. Add hide_prices to catalogs
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS hide_prices BOOLEAN DEFAULT false;
COMMENT ON COLUMN public.catalogs.hide_prices IS 'Se verdadeiro, oculta todos os preços do catálogo, forçando negociação via WhatsApp';

-- 2. Create organization_product_overrides table
CREATE TABLE IF NOT EXISTS public.organization_product_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price_b2c NUMERIC,
  price_b2b NUMERIC,
  has_retail BOOLEAN DEFAULT true,
  has_wholesale BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  is_in_stock BOOLEAN DEFAULT true,
  compare_at_price NUMERIC,
  sort_order INTEGER,
  image_url TEXT,
  image_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, product_id)
);

COMMENT ON TABLE public.organization_product_overrides IS 'Tabela que armazena os overrides de preços e disponibilidade feitos pelos franqueados em produtos do catálogo mestre (CaaS)';

-- 3. RLS Policies for organization_product_overrides
ALTER TABLE public.organization_product_overrides ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for catalog display)
DROP POLICY IF EXISTS "Allow public read access to overrides" ON public.organization_product_overrides;
CREATE POLICY "Allow public read access to overrides"
  ON public.organization_product_overrides FOR SELECT
  USING (true);

-- Policy: Allow members or superadmins to manage overrides
DROP POLICY IF EXISTS "Allow members or superadmins to manage overrides" ON public.organization_product_overrides;
CREATE POLICY "Allow members or superadmins to manage overrides"
  ON public.organization_product_overrides FOR ALL
  USING (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (
        profiles.role::text in ('superadmin', 'super_admin')
        or profiles.organization_id = organization_product_overrides.organization_id
      )
    )
  );

-- 4. Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_org_product_overrides_modtime()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organization_product_overrides_modtime ON public.organization_product_overrides;

CREATE TRIGGER update_organization_product_overrides_modtime
BEFORE UPDATE ON public.organization_product_overrides
FOR EACH ROW EXECUTE FUNCTION update_org_product_overrides_modtime();
