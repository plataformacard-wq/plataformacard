-- Migration: Fix Critical RLS Policies (Profiles, Organizations and Platform Admins Data Exposure)
-- Date: 2026-07-27

-- 1. CORREÇÃO EM PROFILES: Restringir a leitura pública irrestrita de dados pessoais (PII)
-- Apenas o próprio usuário, membros da mesma organização ou main_admins podem ler os dados do perfil.
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow members or self to read profiles" ON public.profiles;

CREATE POLICY "Allow members or self to read profiles" ON public.profiles 
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() = id OR 
  exists (
    select 1 from public.profiles p 
    where p.id = auth.uid() 
    and (
      p.organization_id = profiles.organization_id 
      or p.role::text = 'main_admin'
    )
  )
);

-- 2. CORREÇÃO EM ORGANIZATIONS: Proteger dados sensíveis e tokens OAuth do Bling
-- Apenas membros da própria organização ou main_admins podem visualizar as informações da organização.
DROP POLICY IF EXISTS "Allow public read access to organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow organization members or main_admins to select organizations" ON public.organizations;

CREATE POLICY "Allow organization members or main_admins to select organizations" ON public.organizations 
FOR SELECT USING (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() 
    and (
      profiles.organization_id = organizations.id 
      or profiles.role::text = 'main_admin'
    )
  )
);

-- 3. CORREÇÃO EM PLATFORM_ADMINS: Apenas main_admins podem visualizar os administradores da plataforma
DROP POLICY IF EXISTS "Allow authenticated read to platform_admins" ON public.platform_admins;
DROP POLICY IF EXISTS "Only main_admins can select platform_admins" ON public.platform_admins;

CREATE POLICY "Only main_admins can select platform_admins" ON public.platform_admins 
FOR SELECT USING (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() 
    and profiles.role::text = 'main_admin'
  )
);
