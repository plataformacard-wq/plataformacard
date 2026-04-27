-- Adicionar colunas de controle de status e estoque
ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN is_in_stock BOOLEAN DEFAULT TRUE;
