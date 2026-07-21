-- Adicionar novas colunas de preços
ALTER TABLE landing_page_plans
ADD COLUMN IF NOT EXISTS price_monthly VARCHAR(255),
ADD COLUMN IF NOT EXISTS price_annual VARCHAR(255),
ADD COLUMN IF NOT EXISTS original_price VARCHAR(255);

-- Atualizar o Starter
UPDATE landing_page_plans
SET 
    price_monthly = 'R$ 59,90/mês',
    price_annual = 'R$ 39,90/mês',
    original_price = 'R$ 89,90'
WHERE name = 'Starter';

-- Atualizar o PRO
UPDATE landing_page_plans
SET 
    price_monthly = 'R$ 149,90/mês',
    price_annual = 'R$ 99,90/mês',
    original_price = 'R$ 229,90'
WHERE name = 'PRO';

-- Atualizar o Sales Team
UPDATE landing_page_plans
SET 
    price_monthly = 'R$ 299,90/mês',
    price_annual = 'R$ 199,90/mês',
    original_price = 'R$ 449,90'
WHERE name = 'Sales Team';
