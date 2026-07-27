-- Migração: Correção de Recursão Infinita em Políticas RLS do Supabase (Erro 42P17)
-- Data: 2026-07-27

-- 1. Criar funções helper SECURITY DEFINER para evitar loops de recursão ao consultar profiles nas políticas RLS

CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (id = auth.uid() OR user_id = auth.uid()) 
    AND role::text = 'main_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM public.profiles 
  WHERE (id = auth.uid() OR user_id = auth.uid()) 
  LIMIT 1;
$$;

-- 2. Recriar Política em PROFILES usando as funções SECURITY DEFINER (Sem Recursão)
DROP POLICY IF EXISTS "Allow members or self to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;

CREATE POLICY "Allow members or self to read profiles" ON public.profiles 
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() = id OR 
  public.is_main_admin() OR
  (profiles.organization_id IS NOT NULL AND profiles.organization_id = public.get_my_org_id())
);

-- 3. Recriar Política em ORGANIZATIONS
DROP POLICY IF EXISTS "Allow organization members or main_admins to select organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow public read access to organizations" ON public.organizations;

CREATE POLICY "Allow organization members or main_admins to select organizations" ON public.organizations 
FOR SELECT USING (
  public.is_main_admin() OR
  organizations.id = public.get_my_org_id()
);

-- 4. Recriar Política em PLATFORM_ADMINS
DROP POLICY IF EXISTS "Only main_admins can select platform_admins" ON public.platform_admins;
DROP POLICY IF EXISTS "Allow authenticated read to platform_admins" ON public.platform_admins;

CREATE POLICY "Only main_admins can select platform_admins" ON public.platform_admins 
FOR SELECT USING (
  public.is_main_admin()
);
