-- 1. Create landing_page_settings (Singleton)
CREATE TABLE IF NOT EXISTS public.landing_page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_headline text NOT NULL DEFAULT 'Venda mais com o catálogo digital perfeito',
  hero_subtitle text NOT NULL DEFAULT 'Crie uma vitrine premium para sua empresa, distribuidora ou força de vendas em minutos.',
  seo_title text NOT NULL DEFAULT 'PlataformaShop | Catálogo Digital Premium',
  base_users integer NOT NULL DEFAULT 1500,
  base_catalogs integer NOT NULL DEFAULT 3200,
  updated_at timestamp with time zone DEFAULT now()
);

-- Ensure only one row exists using a constraint or trigger. 
ALTER TABLE public.landing_page_settings ADD COLUMN IF NOT EXISTS is_singleton boolean DEFAULT true UNIQUE CHECK (is_singleton);

-- Insert initial row if not exists
INSERT INTO public.landing_page_settings (is_singleton) VALUES (true) ON CONFLICT DO NOTHING;

-- 2. Create landing_page_testimonials
CREATE TABLE IF NOT EXISTS public.landing_page_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  initials text NOT NULL,
  color text NOT NULL DEFAULT 'bg-blue-500',
  text text NOT NULL,
  stars integer NOT NULL DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create landing_page_partners
CREATE TABLE IF NOT EXISTS public.landing_page_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_partners ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Public Read Access
CREATE POLICY "Public Read Access for Settings" ON public.landing_page_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Testimonials" ON public.landing_page_testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Access for Partners" ON public.landing_page_partners FOR SELECT USING (is_active = true);

-- Note: We do NOT need to create INSERT/UPDATE/DELETE policies for super admin because 
-- the super admin uses createAdminClient() which uses the service_role key, bypassing RLS.
-- This aligns perfectly with the Security Gatekeeper protocol.

-- 6. Storage Bucket for Partners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('landing_assets', 'landing_assets', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage RLS Policies (Allow any authenticated user to upload to landing_assets for simplicity, 
-- but in reality the server actions will use service_role, so they can bypass this too)
CREATE POLICY "Public Access Landing Assets" ON storage.objects FOR SELECT USING (bucket_id = 'landing_assets');
