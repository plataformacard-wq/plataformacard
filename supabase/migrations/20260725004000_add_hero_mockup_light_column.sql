-- Migration: Adicionar coluna hero_mockup_url_light para suporte a mockup do hero em modo claro
-- Data: 25/07/2026

ALTER TABLE public.landing_page_settings
ADD COLUMN IF NOT EXISTS hero_mockup_url_light text;
