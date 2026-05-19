-- Adiciona a coluna para controlar o redirecionamento de clientes quando o vendedor estiver pausado
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS redirect_leads BOOLEAN DEFAULT false;
