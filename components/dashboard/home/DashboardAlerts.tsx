import { motion } from "framer-motion";
import Link from "next/link";
import { Package, MessageCircle, ArrowUpRight } from "lucide-react";

export default function DashboardAlerts({
  hasActiveMasterState,
  hasOwnedMasterState,
  customAlerts,
  upcomingHoliday,
  handleHolidayDecision,
  processingHolidayDecision,
  showNoWhatsappWarning,
  isB2B,
  sellerCount,
  isReady,
  progressPercent,
  coreChecklist,
  avatarUrl,
  hasSellersWithoutPhoto,
  isCaaS,
  isAnalyticAccess
}: any) {
  return (
    <>
      {/* Permanent Catalog Status Banner — oculto para Acesso Analítico */}
      {!isAnalyticAccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-[27px] border backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            hasActiveMasterState 
              ? "border-purple-500/20 bg-purple-500/5"
              : hasOwnedMasterState
              ? "border-blue-500/20 bg-blue-500/5"
              : "border-emerald-500/20 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-[27px] flex items-center justify-center shrink-0 ${
              hasActiveMasterState 
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                : hasOwnedMasterState
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}>
              <Package size={24} />
            </div>
            <div>
              <h3 className={`font-bold text-base ${
                hasActiveMasterState ? "text-purple-800 dark:text-purple-400" : hasOwnedMasterState ? "text-blue-800 dark:text-blue-400" : "text-emerald-800 dark:text-emerald-400"
              }`}>
                {hasActiveMasterState ? "Operando com Catálogo Franqueado" : hasOwnedMasterState ? "Operando com Catálogo Matriz" : "Operando com Catálogo Próprio"}
              </h3>
              <p className={`text-xs mt-1 leading-relaxed max-w-2xl ${
                hasActiveMasterState ? "text-purple-700/80 dark:text-purple-400/80" : hasOwnedMasterState ? "text-blue-700/80 dark:text-blue-400/80" : "text-emerald-700/80 dark:text-emerald-400/80"
              }`}>
                {hasActiveMasterState 
                  ? "Os produtos exibidos na sua vitrine e configurações principais são baseados no catálogo matriz da sua franqueadora."
                  : hasOwnedMasterState
                  ? "Você está operando o catálogo matriz. As alterações aqui refletirão nas lojas da sua rede."
                  : "Os produtos exibidos na sua vitrine são gerenciados exclusivamente por você."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/catalogo/gerenciador"
            className={`shrink-0 w-full sm:w-auto rounded-lg px-5 py-2.5 text-sm font-bold text-white transition flex items-center justify-center gap-2 mt-4 md:mt-0 ${
              hasActiveMasterState ? "bg-purple-600 hover:bg-purple-700" : hasOwnedMasterState ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            Gerenciar
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Mural de Avisos */}
      {customAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          {customAlerts.map((alert: any) => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-[27px] flex items-start gap-3 backdrop-blur-md border ${
                alert.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' :
                alert.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                alert.color === 'green' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' :
                'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {alert.color === 'red' ? '⚠️' : alert.color === 'yellow' ? '⚡' : alert.color === 'green' ? '✅' : 'ℹ️'}
              </div>
              <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Alerta de Feriado */}
      {upcomingHoliday && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 overflow-hidden rounded-[27px] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 md:p-8 relative"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--dash-surface)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--dash-surface)]/20 rounded text-white text-xs font-bold uppercase tracking-wider mb-3">
              <span>📅</span> Feriado se aproximando
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              {upcomingHoliday.name}
            </h3>
            <p className="text-indigo-100 mb-6 text-sm md:text-base max-w-2xl">
              No dia <strong>{upcomingHoliday.date.split('-').reverse().join('/')}</strong> teremos este feriado. 
              Como você deseja operar seu catálogo neste dia?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleHolidayDecision(upcomingHoliday.date, false)}
                disabled={processingHolidayDecision}
                className="bg-[var(--dash-surface)]/20 hover:bg-[var(--dash-surface)]/30 text-white border border-white/20 font-bold px-6 py-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
              >
                🏝️ Vou folgar (Pausar 24h)
              </button>
              <button
                onClick={() => handleHolidayDecision(upcomingHoliday.date, true)}
                disabled={processingHolidayDecision}
                className="bg-[var(--dash-surface)] text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                💼 Vou trabalhar
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Warning WhatsApp */}
      {showNoWhatsappWarning && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[27px] border border-red-500/20 bg-red-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[27px] bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <MessageCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-red-800 dark:text-red-400">
                Atenção: {isB2B && sellerCount === 0 ? "Nenhum Vendedor Cadastrado" : "Catálogo sem Contato"}
              </h3>
              <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1 leading-relaxed max-w-2xl">
                {isB2B && sellerCount === 0
                  ? "Seu catálogo está sem uma frente de vendas! No modelo B2B, a venda ocorre exclusivamente via vendedor. Sem vendedores cadastrados, seus clientes não terão um ponto de contato local para finalizar pedidos."
                  : `Seu catálogo está publicado, mas nenhum número de WhatsApp foi configurado! Seus clientes não conseguirão fazer pedidos. ${isB2B ? "Configure o número de WhatsApp na ficha dos seus vendedores." : "Configure no seu Perfil."}`
                }
              </p>
            </div>
          </div>
          <Link
            href={isB2B ? "/dashboard/vendedores" : "/dashboard/perfil#cartao"}
            className="shrink-0 w-full sm:w-auto rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 flex items-center justify-center gap-2 mt-4 md:mt-0"
          >
            {isB2B ? (sellerCount === 0 ? "Cadastrar Vendedor" : "Configurar Vendedores") : "Configurar WhatsApp"}
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Progress Bar (Setup Checklist) */}
      {!isReady && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-[var(--dash-text-primary)]">Configuração do Catálogo</h3>
              <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
                Seu link público permanecerá em construção até que as 3 configurações obrigatórias sejam concluídas.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
              <div className="w-32 h-3 rounded-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {coreChecklist.map((item: any, idx: number) => (
              <Link key={idx} href={item.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--dash-surface-secondary)] transition group border border-transparent hover:border-[var(--dash-border)]">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${item.done ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[var(--dash-border)] text-[var(--dash-text-muted)]'}`}>
                  {item.done ? "✓" : item.icon}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold transition ${item.done ? 'text-[var(--dash-text-secondary)] line-through opacity-70' : 'text-[var(--dash-text-primary)] group-hover:text-primary'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dica de Foto de Perfil */}
      {((!isB2B && !avatarUrl) || (isB2B && hasSellersWithoutPhoto)) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-[27px] border border-violet-500/20 bg-violet-500/5 backdrop-blur-md flex items-start gap-3"
        >
          <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <span className="text-lg">📸</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-violet-800 dark:text-violet-400">
              {isB2B ? "Dica: Adicione fotos aos perfis da equipe" : "Dica: Adicione uma Foto de Perfil ou Logo"}
            </h4>
            <p className="text-xs text-violet-700/80 dark:text-violet-400/80 mt-1">
              {isB2B 
                ? "Vendedores com foto real transmitem muito mais confiança e convertem até 40% mais. "
                : "Catálogos com fotos de perfil reais ou logotipos de empresas transmitem muito mais confiança e vendem até 40% a mais. "
              }
              <Link href={isB2B ? "/dashboard/vendedores" : "/dashboard/perfil#cartao"} className="font-semibold underline">
                Adicionar agora
              </Link>.
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
}
