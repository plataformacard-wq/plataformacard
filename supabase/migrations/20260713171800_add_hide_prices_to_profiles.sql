-- Adiciona a coluna hide_prices à tabela profiles
ALTER TABLE public.profiles ADD COLUMN hide_prices boolean DEFAULT false;
