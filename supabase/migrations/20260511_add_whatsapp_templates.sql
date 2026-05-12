-- Adicionar coluna de template de WhatsApp aos perfis (B2B Vendedores e B2C Individual)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_template TEXT;

-- Adicionar coluna de template de WhatsApp aos catálogos (CaaS)
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS whatsapp_template TEXT;

-- Comentários para documentação
COMMENT ON COLUMN profiles.whatsapp_template IS 'Modelo personalizado de mensagem de WhatsApp para este perfil';
COMMENT ON COLUMN catalogs.whatsapp_template IS 'Modelo personalizado de mensagem de WhatsApp para os itens deste catálogo';
