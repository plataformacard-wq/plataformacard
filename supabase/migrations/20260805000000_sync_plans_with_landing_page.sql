-- Migration: Sincronizar tabela public.plans com a Matriz Oficial da Landing Page
-- Data: 05/08/2026

-- 1. Adicionar a coluna slug se ela não existir
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS slug text;

-- 2. Inserir ou atualizar os 4 planos oficiais na tabela public.plans
-- OBS: price_monthly é armazenado em centavos (integer), ex: 5990 = R$ 59,90
INSERT INTO public.plans (id, name, slug, max_products, max_users, max_images_per_product, price_monthly)
VALUES 
  ('a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d', 'Starter', 'starter', 100, 1, 3, 5990),
  ('6f3dfe4e-905c-486e-923f-2cfb6e5d3e62', 'PRO', 'pro', 1000, 3, 5, 14990),
  ('32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0', 'Sales Team', 'sales_team', 5000, 10, 10, 29990),
  ('d35c09c2-51a0-4f38-b5d9-dcc3526e7d26', 'All Service', 'all_service', 99999, 99, 20, 49990)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  max_products = EXCLUDED.max_products,
  max_users = EXCLUDED.max_users,
  max_images_per_product = EXCLUDED.max_images_per_product,
  price_monthly = EXCLUDED.price_monthly;

-- 3. Garantir que organizações sem plano recebam o plano Starter por padrão
UPDATE public.organizations
SET plan_id = 'a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d'
WHERE plan_id IS NULL;
