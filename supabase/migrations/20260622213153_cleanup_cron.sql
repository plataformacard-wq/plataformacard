-- Criação da função de limpeza de dados expirados (> 24 meses inativos e não-pagantes)
CREATE OR REPLACE FUNCTION public.cleanup_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Opção 1: Exclusão Lógica (Soft Delete)
  -- Ideal para manter registros financeiros atrelados, mas ofuscando dados sensíveis (LGPD)
  UPDATE public.profiles
  SET 
    status = 'terminated',
    full_name = 'Conta Excluída (LGPD)',
    email = id || '@deleted.plataformacard.com.br',
    whatsapp = null,
    bio = null,
    avatar_url = null
  WHERE 
    subscription_status IN ('canceled', 'unpaid') 
    AND updated_at < NOW() - INTERVAL '24 months'
    AND status != 'terminated';

  -- Opção 2: Exclusão Física (Hard Delete) - Descomente caso as restrições de chave estrangeira permitam (CASCADE)
  -- DELETE FROM public.profiles 
  -- WHERE subscription_status IN ('canceled', 'unpaid') 
  -- AND updated_at < NOW() - INTERVAL '24 months';
  
  -- Exclui catálogos vinculados a esses perfis (se soft-delete)
  -- DELETE FROM public.catalogs WHERE owner_id IN (
  --   SELECT id FROM public.profiles WHERE status = 'terminated'
  -- );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agendamento usando a extensão pg_cron
-- Roda todo dia 1º de cada mês, às 03:00 da manhã
-- OBS: A extensão pg_cron precisa estar habilitada no Supabase (Database -> Extensions -> pg_cron)
SELECT cron.schedule(
  'cleanup_expired_subscriptions_job', -- nome do job
  '0 3 1 * *',                         -- cron expression (todo dia 1 as 3am)
  'SELECT public.cleanup_expired_subscriptions()'
);
