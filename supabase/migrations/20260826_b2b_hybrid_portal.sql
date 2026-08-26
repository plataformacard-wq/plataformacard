-- ============================================================================
-- MIGRAÇÃO B2B PLANO ZEON: PORTAL HÍBRIDO E TABELAS DE PREÇO POR SKU
-- ============================================================================

-- 1. Tabela de Clientes B2B (Suporta Convite Direto e Solicitação Inbound)
CREATE TABLE IF NOT EXISTS public.b2b_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    cnpj_cpf TEXT NOT NULL,
    company_name TEXT NOT NULL,
    trade_name TEXT,
    phone_whatsapp TEXT NOT NULL,
    access_token TEXT UNIQUE DEFAULT gen_random_uuid()::text NOT NULL,
    access_pin TEXT DEFAULT '123456',
    assigned_price_key TEXT DEFAULT 'tabela_x', -- 'bling', 'tabela_x', 'tabela_y', 'tabela_z'
    status TEXT NOT NULL DEFAULT 'pending_approval', -- 'pending_approval', 'approved', 'rejected'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, cnpj_cpf)
);

-- 2. Cache de Preços Sincronizados da Planilha Google Sheets por SKU
CREATE TABLE IF NOT EXISTS public.b2b_sku_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    prices JSONB NOT NULL DEFAULT '{}'::jsonb, -- Ex: {"bling": 100.00, "tabela_x": 80.00, "tabela_y": 85.00}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, sku)
);

-- 3. Configuração do Google Sheets por Organização
CREATE TABLE IF NOT EXISTS public.b2b_sheets_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sheet_id TEXT NOT NULL,
    tab_name TEXT DEFAULT 'Precos',
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id)
);

-- 4. Registro de Pedidos B2B
CREATE TABLE IF NOT EXISTS public.b2b_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    b2b_client_id UUID REFERENCES public.b2b_clients(id) ON DELETE SET NULL,
    bling_order_id TEXT,
    price_key_used TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent_to_bling', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes para alta performance de consulta
CREATE INDEX IF NOT EXISTS idx_b2b_clients_org ON public.b2b_clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_b2b_clients_token ON public.b2b_clients(access_token);
CREATE INDEX IF NOT EXISTS idx_b2b_sku_prices_org_sku ON public.b2b_sku_prices(organization_id, sku);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_org ON public.b2b_orders(organization_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.b2b_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_sku_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_sheets_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Permissivas para Serviço / Autenticação
CREATE POLICY "b2b_clients_service_policy" ON public.b2b_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "b2b_sku_prices_service_policy" ON public.b2b_sku_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "b2b_sheets_config_service_policy" ON public.b2b_sheets_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "b2b_orders_service_policy" ON public.b2b_orders FOR ALL USING (true) WITH CHECK (true);
