-- Adiciona campos de integração com o Bling na tabela organizations
ALTER TABLE public.organizations 
ADD COLUMN bling_access_token text,
ADD COLUMN bling_refresh_token text,
ADD COLUMN bling_token_expires_at timestamp with time zone,
ADD COLUMN bling_store_id text;
