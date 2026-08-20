-- Migration: Adicionar coluna subscription_status à tabela public.organizations
-- Data: 20/08/2026

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';

-- Atualizar organizações existentes sem status de assinatura
UPDATE public.organizations 
SET subscription_status = 'active' 
WHERE subscription_status IS NULL;
