-- Migration: Atualizar links dos botões da Landing Page para apontar para o /checkout?plan=...
-- Data: 25/07/2026

UPDATE landing_page_plans 
SET button_url = '/checkout?plan=starter' 
WHERE LOWER(name) LIKE '%starter%' OR button_url = '/cadastro';

UPDATE landing_page_plans 
SET button_url = '/checkout?plan=pro' 
WHERE LOWER(name) LIKE '%pro%' OR button_url = '/cadastro?plan=pro';

UPDATE landing_page_plans 
SET button_url = '/checkout?plan=sales_team' 
WHERE LOWER(name) LIKE '%sales%' OR LOWER(name) LIKE '%team%' OR LOWER(name) LIKE '%premium%';

UPDATE landing_page_plans 
SET button_url = '/checkout?plan=all_service' 
WHERE LOWER(name) LIKE '%franqueador%' OR LOWER(name) LIKE '%all_service%' OR LOWER(name) LIKE '%enterprise%';
