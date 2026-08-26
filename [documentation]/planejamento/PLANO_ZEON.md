# ⚡ Plano Zeon: Portal B2B Híbrido & Tabelas de Preço Personalizadas (Maj Mobilidade)

> **Documento Oficial de Planejamento B2B:** Este documento especifica o módulo **Zeon**, desenvolvido para a PlataformaShop/Maj Mobilidade. O Zeon permite o gerenciamento de múltiplos canais de preços (Tabela Bling, Tabela X, Tabela Y, Tabela Z via Google Sheets), o fluxo de acesso pré-configurado por cliente B2B e a integração de pedidos de venda no Bling ERP v3.

---

## 🎯 Arquitetura do Fluxo Híbrido Zeon (B2B)

```
                          ┌───────────────────────────────────────────────┐
                          │     PORTAL B2B MAJ MOBILIDADE (SLUG)          │
                          └──────────────────────┬────────────────────────┘
                                                 │
                  ┌──────────────────────────────┴──────────────────────────────┐
                  ▼                                                             ▼
       [ FLUXO A: CONVITE DIRETO ]                                   [ FLUXO B: SOLICITAÇÃO NO SITE ]
   (Clientes Conhecidos / Outbound)                               (Novos Lojistas / Inbound)
                  │                                                             │
                  ▼                                                             ▼
 1. Gestor cadastra no Dashboard                           1. Lojista clica em "Quero ser Revendedor"
 2. Seleciona a Tabela Y (Margem Ajustada)                  2. Digita CNPJ e WhatsApp no catálogo
 3. Envia o Link Exclusivo via WhatsApp                    3. Tela: "Preparando ofertas especiais..."
                  │                                                             │
                  ▼                                                             ▼
 4. Cliente abre o link e compra na hora                   4. Gestor analisa CNPJ no Dashboard
    com a Tabela Y ativada                                 5. Seleciona Tabela Y e clica "Aprovar"
                                                           6. Dispara WhatsApp automático c/ link
```

---

## 📌 Premissas & Diferenciais Estratégicos (Plano Zeon)

1. **Preço Base no Bling ERP Intacto:** O cadastro oficial do produto no Bling ERP v3 é mantido como preço de referência sem alterações. Os preços atacadistas/B2B diferenciados (Tabela X, Y, Z) são sincronizados a partir de uma **Planilha do Google Sheets** por SKU.
2. **Sem Acesso Genérico:** O público geral continua acessando apenas a vitrine comum de varejo. Ninguém visualiza preços de atacado antes do gestor definir e aprovar qual tabela se aplica àquele CNPJ.
3. **Captação de Novos Revendedores (Inbound):** Se um novo lojista tentar se cadastrar no site, ele recebe a mensagem de retenção: *"Solicitação recebida com sucesso! Estamos preparando ofertas e condições especiais para o perfil da sua empresa..."*. O gestor é notificado no Dashboard, analisa a margem, escolhe a tabela (X, Y ou Z) e aprova.
4. **Integração Reativa com Bling ERP v3:** Ao finalizar o pedido no catálogo B2B, a PlataformaShop gera o Pedido de Venda via API v3 do Bling (`POST /pedidos/vendas`), enviando os SKUs corretos e os valores negociados da tabela do cliente.

---

## 🛠️ Especificação de Implementação Técnica

---

### 1. Estrutura de Banco de Dados (Supabase Migration)

Arquivo: `supabase/migrations/20260826_b2b_hybrid_portal.sql`

```sql
-- 1. Tabela de Clientes B2B (Suporta Fluxo A e Fluxo B)
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

-- 3. Configuração do Google Sheets
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
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.b2b_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_sku_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_sheets_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;
```

---

### 2. Gestão B2B no Dashboard (PlataformaShop)

- **Rota:** `app/dashboard/b2b/page.tsx`
- **Painel de Gestão:**
  1. **Solicitações Pendentes (Inbound):** Analisar CNPJ, selecionar tabela de preço (X, Y, Z) e disparar aprovação via WhatsApp.
  2. **Clientes Ativos:** Listar lojistas aprovados, gerenciar tokens e reenviar links de acesso exclusivo.
  3. **Novo Lojista (Outbound):** Cadastrar revendedor diretamente e gerar link de convite em 1-clique.
  4. **Conexão Google Sheets:** Sincronizar planilha de preços por SKU.

---

### 3. Catálogo Adaptável (`/majmobilidade`)

- **Componente Modal:** `components/catalog/B2bRegisterModal.tsx`
- **Adaptação Dinâmica:** Se a URL contiver `?b2b=TOKEN`, valida a sessão e exibe os preços da tabela negociada para o cliente.
- **Compra em Lote:** Modal de grade rápida de pedidos B2B.

---

### 4. Integração Bling ERP v3 (API de Pedidos)

- **API Route:** `app/api/b2b/orders/route.ts`
- Dispara a chamada `POST /pedidos/vendas` na API v3 do Bling vinculando os SKUs e os valores negociados da tabela do cliente.

---

## 📝 Histórico e Status do Documento

- **Nome Oficial:** Plano Zeon
- **Projeto:** PlataformaShop / Maj Mobilidade
- **Data de Registro:** 26/08/2026
- **Status:** Planejamento Concluído e Arquivado (Pronto para Execução Futura)
