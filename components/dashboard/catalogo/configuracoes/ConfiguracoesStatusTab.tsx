"use client";

import { Save, Loader2, CheckCircle2, Activity, Zap, Info } from "lucide-react";
import { motion } from "framer-motion";

interface ConfiguracoesStatusTabProps {
  isInheritingMaster: boolean;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  saving: boolean;
  saved: boolean;
  handleSave: () => void;
}

export default function ConfiguracoesStatusTab({
  isInheritingMaster,
  isActive,
  setIsActive,
  saving,
  saved,
  handleSave,
}: ConfiguracoesStatusTabProps) {
  return (
    <motion.div
      key="status"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid gap-8"
    >
      <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 md:p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-[var(--dash-border)] pb-8">
          <div className="h-14 w-14 rounded-[27px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Activity size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Status do Catálogo</h3>
            <p className="text-sm text-[var(--dash-text-muted)] font-medium">Controle a disponibilidade e informações de herança do seu catálogo.</p>
          </div>
        </div>

        {isInheritingMaster && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 mb-2">
            <p className="text-sm font-medium flex items-start gap-2">
              <Info size={18} className="shrink-0 mt-0.5" />
              Você está operando com um Catálogo Franqueado (Master). As informações básicas do seu catálogo são herdadas automaticamente. Você ainda pode alterar o Comportamento da Vitrine e Banners.
            </p>
          </div>
        )}

        <div className="grid gap-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                <Zap size={14} className="text-primary" /> Ativar/Desativar Catálogo Próprio
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--dash-surface)] shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {!isActive && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                <p className="text-sm font-medium flex items-start gap-2">
                  <Info size={18} className="shrink-0 mt-0.5" />
                  Seu catálogo próprio está <strong>desativado</strong>. Os clientes não conseguirão ver seus produtos personalizados. Mantenha desativado caso esteja usando um Catálogo Master (Franquia/Plataforma).
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              flex items-center gap-3 px-12 py-4 rounded-[27px] font-black text-lg transition-all shadow-xl
              ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'}
              disabled:opacity-50
            `}
          >
            {saving ? (
              <Loader2 size={24} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={24} />
            ) : (
              <Save size={24} />
            )}
            {saved ? 'Salvo com Sucesso!' : saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </section>
    </motion.div>
  );
}
