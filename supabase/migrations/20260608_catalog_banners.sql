-- Migration: Add banners JSONB column to catalogs table to allow lojistas to configure and store custom banners
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS banners jsonb DEFAULT '[]'::jsonb;
