-- Migration: Add banner settings for controlling carousel speed and initial banner display behavior
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS banner_speed_seconds INT DEFAULT 5;
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS banner_initial_index INT DEFAULT 0;
