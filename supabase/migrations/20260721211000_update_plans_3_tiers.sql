-- Desativar os planos antigos
UPDATE landing_page_plans SET is_active = false;

-- 1. Inserir o plano Starter
INSERT INTO landing_page_plans (
  name, price_text, subtitle, badge_text, theme, features, button_text, button_url, display_order, is_active
) VALUES (
  'Starter', 
  'R$ 39,90/mês', 
  'Para autônomos que estão começando.', 
  null, 
  'dark', 
  to_jsonb(ARRAY[
    'Catálogo online sempre atualizado', 
    'Taxa 0% em qualquer venda', 
    'Status da conversa - Acompanhe cada negociação (CRM)', 
    'Atualização de estoque a cada venda',
    'Link exclusivo: www.anotameucontato.com.br/você'
  ]), 
  'Começar Grátis', 
  '/cadastro', 
  10, 
  true
);

-- 2. Inserir o plano PRO (Destaque Intermediário)
INSERT INTO landing_page_plans (
  name, price_text, subtitle, badge_text, theme, features, button_text, button_url, display_order, is_active
) VALUES (
  'PRO', 
  'R$ 99,90/mês', 
  'Para lojistas que buscam automação.', 
  'Recomendado', 
  'green', 
  to_jsonb(ARRAY[
    'Tudo do Starter', 
    'Assistente de IA para Produtos e SEO', 
    'Estoque Automatizado via Bling V3', 
    'Domínio Próprio e Catálogo no seu Site',
    '1 Cartão NFC Premium (No plano Anual)'
  ]), 
  'Assinar PRO', 
  '/cadastro?plan=pro', 
  20, 
  true
);

-- 3. Inserir o plano Sales Team
INSERT INTO landing_page_plans (
  name, price_text, subtitle, badge_text, theme, features, button_text, button_url, display_order, is_active
) VALUES (
  'Sales Team', 
  'R$ 199,90/mês', 
  'Para franquias e times de vendas.', 
  'Corporativo', 
  'dark', 
  to_jsonb(ARRAY[
    'Tudo do PRO', 
    'Gestão CaaS: Catálogo Master Franquias', 
    'CRM Multi-Vendedores (Leads da Equipe)',
    'Pacote de 3 a 5 Cartões NFC Premium',
    'Suporte Prioritário'
  ]), 
  'Falar com Consultor', 
  'https://wa.me/5527999999999?text=Ol%C3%A1%2C%20quero%20assinar%20o%20plano%20Sales%20Team.', 
  30, 
  true
);
