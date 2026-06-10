-- Permissão de Desvinculação para Inquilinos CaaS
ALTER TABLE organization_catalogs 
ADD COLUMN IF NOT EXISTS allow_caas_detachment BOOLEAN DEFAULT false;

-- Rastreio do Clone (para Restauração)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS source_caas_id UUID DEFAULT NULL REFERENCES products(id) ON DELETE SET NULL;
