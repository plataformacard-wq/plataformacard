-- Migration para adicionar domínios customizados
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE;

-- Comentário para documentar
COMMENT ON COLUMN organizations.custom_domain IS 'Domínio personalizado configurado via Vercel API';
