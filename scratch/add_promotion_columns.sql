-- Adicionar colunas para suporte a Preço De/Por e controle independente de módulos
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_retail boolean DEFAULT true;

-- Comentário para documentação:
-- compare_at_price: Preço original ("De")
-- has_retail: Se o módulo de varejo deve ser exibido
-- has_wholesale: Já existe, controla o módulo de atacado
