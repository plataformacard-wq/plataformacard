-- Criar tabela para armazenar os hashes dos códigos de resgate de 2FA
CREATE TABLE IF NOT EXISTS public.user_2fa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_2fa_backup_codes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Usuário só pode gerenciar/usar seus próprios códigos de resgate
CREATE POLICY "Users can view their own backup codes"
    ON public.user_2fa_backup_codes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup codes"
    ON public.user_2fa_backup_codes
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup codes"
    ON public.user_2fa_backup_codes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_2fa_backup_codes_user_id ON public.user_2fa_backup_codes(user_id);
