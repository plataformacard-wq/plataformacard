-- 1. Adicionar colunas de CRM na tabela leads_tracking
ALTER TABLE public.leads_tracking
  ADD COLUMN IF NOT EXISTS crm_status TEXT NOT NULL DEFAULT 'new_lead'
    CHECK (crm_status IN ('new_lead', 'open', 'negotiating', 'closed')),
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS stock_deducted INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Atualizar política de RLS: membros podem atualizar seus próprios leads
DROP POLICY IF EXISTS "Only superadmins can update/delete leads" ON public.leads_tracking;

CREATE POLICY "Members can update leads of their org"
  ON public.leads_tracking
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.organization_id = leads_tracking.organization_id
    )
  );

-- 3. Índice para performance do Kanban
CREATE INDEX IF NOT EXISTS idx_leads_tracking_crm_status
  ON public.leads_tracking(organization_id, crm_status);

CREATE INDEX IF NOT EXISTS idx_leads_tracking_profile_id
  ON public.leads_tracking(profile_id);
