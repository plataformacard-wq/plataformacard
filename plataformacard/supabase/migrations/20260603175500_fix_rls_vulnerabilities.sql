-- Migration: Fix RLS Vulnerabilities in master_catalog_notifications and catalogs
-- Created: 2026-06-03

-- 1. Restringir leitura de notificações master apenas a usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de notificações para todos" ON public.master_catalog_notifications;
CREATE POLICY "Permitir leitura de notificações para usuários logados" 
ON public.master_catalog_notifications FOR SELECT TO authenticated USING (true);

-- 2. Restringir criação de catálogos do tipo 'platform' para apenas Super Admins
DROP POLICY IF EXISTS "Allow authenticated users to create catalogs" ON public.catalogs;
CREATE POLICY "Allow authenticated users to create catalogs" ON public.catalogs 
FOR INSERT TO authenticated WITH CHECK (
  (owner_id = auth.uid() AND (catalog_type IS NULL OR catalog_type <> 'platform')) OR 
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() 
    and profiles.role::text in ('superadmin', 'super_admin')
  )
);
