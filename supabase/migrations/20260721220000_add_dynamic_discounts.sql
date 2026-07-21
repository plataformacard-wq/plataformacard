-- Adicionar novas colunas de descontos dinâmicos
ALTER TABLE landing_page_plans
ADD COLUMN IF NOT EXISTS annual_discount_type VARCHAR(50) DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS annual_discount_value NUMERIC(10, 2) DEFAULT 0;

-- Atualizar o Starter (Âncora 89,90 -> Mensal: 59,90, Anual: 39,90 => Desconto Fixo Anual de 50,00)
UPDATE landing_page_plans
SET 
    annual_discount_type = 'fixed',
    annual_discount_value = 50.00
WHERE name = 'Starter';

-- Atualizar o PRO (Âncora 229,90 -> Mensal: 149,90, Anual: 99,90 => Desconto Fixo Anual de 130,00)
UPDATE landing_page_plans
SET 
    annual_discount_type = 'fixed',
    annual_discount_value = 130.00
WHERE name = 'PRO';

-- Atualizar o Sales Team (Âncora 449,90 -> Mensal: 299,90, Anual: 199,90 => Desconto Fixo Anual de 250,00)
UPDATE landing_page_plans
SET 
    annual_discount_type = 'fixed',
    annual_discount_value = 250.00
WHERE name = 'Sales Team';
