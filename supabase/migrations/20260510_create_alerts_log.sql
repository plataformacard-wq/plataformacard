-- Tabela para controle de disparos de alertas
CREATE TABLE IF NOT EXISTS platform_alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'db_usage', 'bandwidth', 'storage'
  severity TEXT NOT NULL,   -- 'warning', 'critical', 'emergency'
  percentage INTEGER NOT NULL,
  last_sent_at TIMESTAMPTZ DEFAULT now(),
  
  -- Garante que não tenhamos logs infinitos, apenas os mais recentes
  CONSTRAINT unique_alert_severity UNIQUE (alert_type, severity)
);

-- Comentário para documentação
COMMENT ON TABLE platform_alerts_log IS 'Log de controle para evitar spam de notificações de infraestrutura.';
