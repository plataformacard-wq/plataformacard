"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  Activity, 
  MousePointer2, 
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Image as ImageIcon,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import { getSaaSResourceMetrics, ResourceMetrics } from "@/app/admin/recursos/actions";

export default function ResourceManagementClient() {
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getSaaSResourceMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getStatusColor = (percent: number) => {
    if (percent > 85) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (percent > 60) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  };

  const getProgressBarColor = (percent: number) => {
    if (percent > 85) return "bg-rose-500";
    if (percent > 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (!metrics && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-emerald-500" size={32} />
        <p style={{ color: "var(--dash-text-secondary)" }} className="font-medium">Analisando infraestrutura...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: "var(--dash-text-primary)" }}>
            <Activity className="text-emerald-500" />
            Gestão de Recursos
          </h1>
          <p style={{ color: "var(--dash-text-secondary)" }} className="text-sm mt-1">Monitoramento de saúde técnica e limites do Plano Free</p>
        </div>
        <button 
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all border border-emerald-500/20 text-sm font-bold"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar Dados
        </button>
      </div>

      {/* Grid de Métricas de Infraestrutura (Sem redundância com QG) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Leads Totais", value: metrics?.totalLeads, icon: MousePointer2, color: "text-emerald-500" },
          { label: "Eventos Analytics", value: metrics?.totalAnalytics, icon: TrendingUp, color: "text-orange-500" },
          { label: "Imagens no Storage", value: metrics?.totalImages, icon: ImageIcon, color: "text-blue-500" },
          { label: "Total de Registros", value: (metrics?.totalSellers || 0) + (metrics?.totalProducts || 0) + (metrics?.totalLeads || 0) + (metrics?.totalAnalytics || 0), icon: Layers, color: "text-purple-500" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border p-6 rounded-2xl shadow-xl hover:border-emerald-500/20 transition-all group"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>{item.label}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>{item.value?.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Seção de Capacidade de Infraestrutura */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Banco de Dados */}
        <div className="border p-8 rounded-3xl shadow-2xl relative overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="absolute top-0 right-0 p-4 opacity-5" style={{ color: "var(--dash-text-primary)" }}>
            <Database size={120} />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Armazenamento de Dados</h3>
              <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Limite do Plano Free: 500MB</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>Capacidade Utilizada (Est.)</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(metrics?.dbUsagePercent || 0)}`}>
                {metrics?.dbUsagePercent}%
              </span>
            </div>
            
            <div className="h-4 bg-[var(--dash-bg)] rounded-full overflow-hidden border border-[var(--dash-border)] p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.dbUsagePercent || 0}%` }}
                className={`h-full rounded-full ${getProgressBarColor(metrics?.dbUsagePercent || 0)} shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--dash-text-muted)" }}>Status do Banco</p>
                <p className={`text-lg font-bold flex items-center gap-2 ${metrics?.dbUsagePercent && metrics.dbUsagePercent > 80 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {metrics?.dbUsagePercent && metrics.dbUsagePercent > 80 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  {metrics?.dbUsagePercent && metrics.dbUsagePercent > 80 ? 'Crítico' : 'Saudável'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--dash-text-muted)" }}>Sellers Ativos</p>
                <p className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>{metrics?.totalSellers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tráfego e Largura de Banda */}
        <div className="border p-8 rounded-3xl shadow-2xl relative overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="absolute top-0 right-0 p-4 opacity-5" style={{ color: "var(--dash-text-primary)" }}>
            <HardDrive size={120} />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500">
              <HardDrive size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Largura de Banda (Vercel)</h3>
              <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Limite Mensal: 100GB</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>Tráfego Estimado</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(metrics?.bandwidthUsagePercent || 0)}`}>
                {metrics?.bandwidthUsagePercent}%
              </span>
            </div>
            
            <div className="h-4 bg-[var(--dash-bg)] rounded-full overflow-hidden border border-[var(--dash-border)] p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${metrics?.bandwidthUsagePercent || 0}%` }}
                className={`h-full rounded-full ${getProgressBarColor(metrics?.bandwidthUsagePercent || 0)} shadow-[0_0_15px_rgba(249,115,22,0.3)]`}
              />
            </div>

            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mt-6">
              <div className="flex gap-4">
                <TrendingUp className="text-emerald-500 shrink-0" size={24} />
                <div>
                  <h4 className="text-emerald-500 font-bold text-sm">Escalabilidade Alta</h4>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                    Seu tráfego atual está muito abaixo do limite. Você pode suportar um aumento massivo de acessos sem custos adicionais de infraestrutura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com Meta-informação */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest pt-8 border-t" style={{ color: "var(--dash-text-muted)", borderColor: "var(--dash-border)" }}>
        <span className="flex items-center gap-1.5"><RefreshCw size={10} /> Última atualização: {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString() : '--:--'}</span>
        <span className="w-1 h-1 bg-[var(--dash-border)] rounded-full" />
        <span>Infraestrutura PlataformaCard v1.0</span>
      </div>
    </div>
  );
}
