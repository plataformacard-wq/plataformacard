-- Migração para suporte a Códigos de Backup de Emergência (2FA/MFA)
-- PlataformaShop

CREATE TABLE IF NOT EXISTS public.user_mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para buscas rápidas por usuário e hash
CREATE INDEX IF NOT EXISTS idx_user_mfa_backup_codes_user_id ON public.user_mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_backup_codes_lookup ON public.user_mfa_backup_codes(user_id, code_hash) WHERE used_at IS NULL;

-- Habilitar RLS
ALTER TABLE public.user_mfa_backup_codes ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança RLS
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios códigos de backup" ON public.user_mfa_backup_codes;

CREATE POLICY "Usuários podem gerenciar seus próprios códigos de backup" 
ON public.user_mfa_backup_codes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
