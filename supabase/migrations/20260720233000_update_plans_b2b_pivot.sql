-- Desativar os planos antigos
UPDATE landing_page_plans SET is_active = false;

-- Inserir o plano Starter (Isca)
INSERT INTO landing_page_plans (
  name, 
  price_text, 
  subtitle, 
  badge_text, 
  theme, 
  features, 
  button_text, 
  button_url, 
  display_order, 
  is_active
) VALUES (
  'Starter', 
  'R$ 39,90/mês', 
  'Para autônomos que estão começando.', 
  null, 
  'dark', 
  ARRAY['Cartão Digital + Catálogo online', 'Checkout Transacional (Taxa 0%)', 'Domínio Genérico'], 
  'Começar Grátis', 
  '/cadastro', 
  10, 
  true
);

-- Inserir o plano Sales Team / B2B Elite (Principal)
INSERT INTO landing_page_plans (
  name, 
  price_text, 
  subtitle, 
  badge_text, 
  theme, 
  features, 
  button_text, 
  button_url, 
  display_order, 
  is_active
) VALUES (
  'Sales Team', 
  'R$ 199,90/mês', 
  'Para equipes de vendas com fluxo intenso.', 
  'Recomendado', 
  'green', 
  ARRAY['Estoque Sincronizado Bling V3', 'CRM e Painel Analítico de Vendas', 'Domínio Próprio e iFrame Integrado', 'Pacote de 3 a 5 Cartões NFC Premium (Grátis na fidelidade)'], 
  'Agendar Demonstração', 
  'https://wa.me/5527999999999?text=Ol%C3%A1%2C%20quero%20assinar%20o%20plano%20Sales%20Team%20para%20minha%20equipe.', 
  20, 
  true
);
