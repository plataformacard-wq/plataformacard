-- Add hide_cta column to catalogs table
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS hide_cta BOOLEAN DEFAULT false;

-- Document column
COMMENT ON COLUMN catalogs.hide_cta IS 'Se verdadeiro, oculta os CTAs/botões de contato no WhatsApp do catálogo (vitrine pura)';
