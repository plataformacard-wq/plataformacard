-- Migration: Adicionar colunas de logos e suporte à tabela landing_page_settings
-- Data: 25/07/2026

ALTER TABLE public.landing_page_settings
ADD COLUMN IF NOT EXISTS logo_url_dark text,
ADD COLUMN IF NOT EXISTS logo_url_light text,
ADD COLUMN IF NOT EXISTS support_email text,
ADD COLUMN IF NOT EXISTS support_phone text;
