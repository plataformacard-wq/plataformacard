-- Migration: Adicionar redes sociais à tabela organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS social_instagram text,
ADD COLUMN IF NOT EXISTS social_facebook text,
ADD COLUMN IF NOT EXISTS social_tiktok text,
ADD COLUMN IF NOT EXISTS social_youtube text;
