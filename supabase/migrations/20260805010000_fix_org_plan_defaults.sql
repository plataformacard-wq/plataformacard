-- Migration: Sanitização dos UUIDs de planos nas organizações
-- Data: 05/08/2026

UPDATE public.organizations
SET plan_id = 'a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d'
WHERE plan_id IS NULL OR plan_id NOT IN (
  'a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d',
  '6f3dfe4e-905c-486e-923f-2cfb6e5d3e62',
  '32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0',
  'd35c09c2-51a0-4f38-b5d9-dcc3526e7d26'
);
