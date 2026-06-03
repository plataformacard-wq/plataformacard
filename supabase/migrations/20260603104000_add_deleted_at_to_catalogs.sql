-- Migration: Add deleted_at column to catalogs table for soft deletion support

ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.catalogs.deleted_at IS 'Data/hora em que o catálogo foi enviado para a lixeira (null se ativo)';
