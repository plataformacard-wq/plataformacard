-- Adiciona campos de destaque ao produto
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS highlight_text TEXT,
ADD COLUMN IF NOT EXISTS show_highlight BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.highlight_text IS 'Texto curto para destacar diferenciais do produto (ex: Exclusivo, Edição Limitada)';
COMMENT ON COLUMN products.show_highlight IS 'Controle de visibilidade do campo de destaque no catálogo público';
