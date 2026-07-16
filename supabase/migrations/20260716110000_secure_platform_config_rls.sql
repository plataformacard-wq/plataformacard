-- Migration: Secure platform_config RLS Policies
-- Created: 2026-07-16

-- 1. Remover política pública vulnerável
DROP POLICY IF EXISTS "Permitir leitura pública das configs" ON public.platform_config;

-- 2. Criar política pública que proíbe leitura de chaves sensíveis
CREATE POLICY "Permitir leitura pública das configs" ON public.platform_config 
FOR SELECT USING (
  key NOT IN (
    'gemini_api_key', 
    'beta_invite_code', 
    'telegram_bot_token', 
    'telegram_chat_id', 
    'payment_webhook_secret', 
    'bling_client_secret',
    'bling_client_id'
  )
);

-- 3. Assegurar que Super Admins continuam tendo acesso total de leitura/escrita
DROP POLICY IF EXISTS "Apenas SuperAdmins alteram configs" ON public.platform_config;
CREATE POLICY "Apenas SuperAdmins alteram configs" ON public.platform_config 
FOR ALL TO authenticated USING (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() 
    and profiles.role::text in ('main_admin', 'superadmin', 'super_admin')
  )
);
