-- Migration: Adicionar suporte a porcentagem de ancoragem dinâmica por cliente B2B
-- Data: 2026-08-28

-- 1. Adicionar coluna anchor_percent na tabela de clientes B2B
ALTER TABLE public.b2b_clients 
ADD COLUMN IF NOT EXISTS anchor_percent NUMERIC(5,2) DEFAULT NULL;

-- 2. Adicionar coluna default_anchor_percent na configuração da organização
ALTER TABLE public.b2b_sheets_config 
ADD COLUMN IF NOT EXISTS default_anchor_percent NUMERIC(5,2) DEFAULT 30.00;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.b2b_clients.anchor_percent IS 'Porcentagem de markup de ancoragem customizada para o cliente B2B (ex: 30.00 para +30%). Se NULL, herda o padrão da organização.';
COMMENT ON COLUMN public.b2b_sheets_config.default_anchor_percent IS 'Porcentagem padrão de ancoragem da organização caso o cliente não tenha percentual customizado.';
