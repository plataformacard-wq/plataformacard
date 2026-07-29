-- Migration: Adicionar suporte a galerias de mockups e tempo de rotação do carrossel no hero
-- Data: 29/07/2026

ALTER TABLE public.landing_page_settings
ADD COLUMN IF NOT EXISTS hero_mockups_dark jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hero_mockups_light jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hero_carousel_interval integer DEFAULT 4000;
