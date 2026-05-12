-- Adicionar coluna de tipo aos catálogos
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service', 'hybrid'));

-- Adicionar coluna de tipo aos produtos/serviços
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service'));

-- Comentários para documentação do schema
COMMENT ON COLUMN catalogs.type IS 'Define se o catálogo é de produtos, serviços ou híbrido';
COMMENT ON COLUMN products.type IS 'Define se o item individual é um produto ou serviço (relevante para catálogos híbridos)';
