-- Adiciona a coluna para controlar o recesso temporário automático dos vendedores
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recess_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
