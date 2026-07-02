-- Adiciona a flag allow_price_overrides para permitir ou bloquear a edição de preços por franqueados
ALTER TABLE public.catalogs 
ADD COLUMN IF NOT EXISTS allow_price_overrides BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.catalogs.allow_price_overrides IS 'Define se os franqueados que herdarem este catálogo poderão sobrescrever os preços originais.';
