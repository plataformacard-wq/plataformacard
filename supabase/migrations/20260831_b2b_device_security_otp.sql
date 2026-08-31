-- ============================================================================
-- MIGRAÇÃO: SEGURANÇA B2B (TRUSTED DEVICES & WHATSAPP OTP)
-- ============================================================================

ALTER TABLE public.b2b_clients 
ADD COLUMN IF NOT EXISTS trusted_device_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_otp_code TEXT,
ADD COLUMN IF NOT EXISTS current_otp_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS require_device_verification BOOLEAN DEFAULT true;

-- Comentários de Documentação
COMMENT ON COLUMN public.b2b_clients.trusted_device_ids IS 'Lista de UUIDs de navegadores/dispositivos autorizados';
COMMENT ON COLUMN public.b2b_clients.current_otp_code IS 'Código temporário de 6 dígitos para validação de novo dispositivo';
COMMENT ON COLUMN public.b2b_clients.current_otp_expires_at IS 'Data/hora limite de expiração do código OTP';
