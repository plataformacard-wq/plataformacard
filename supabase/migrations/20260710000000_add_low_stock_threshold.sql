-- Adiciona coluna para definir o limite de alerta de baixo estoque por organização
ALTER TABLE organizations
ADD COLUMN low_stock_threshold integer DEFAULT 5;
