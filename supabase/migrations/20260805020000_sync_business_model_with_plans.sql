-- Migration: Sincronização automática do business_model com o plano
-- Data: 05/08/2026

-- 1. Empresas no plano STARTER (ou sem plano) passam para B2C
UPDATE public.organizations
SET business_model = 'B2C'
WHERE plan_id = 'a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d' OR plan_id IS NULL;

-- 2. Empresas nos demais planos (PRO, Sales Team, All Service) passam para B2B
UPDATE public.organizations
SET business_model = 'B2B'
WHERE plan_id IN (
  '6f3dfe4e-905c-486e-923f-2cfb6e5d3e62',
  '32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0',
  'd35c09c2-51a0-4f38-b5d9-dcc3526e7d26'
);
