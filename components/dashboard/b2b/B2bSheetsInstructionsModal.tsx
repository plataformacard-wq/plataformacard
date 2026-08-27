"use client";

import React from "react";
import { 
  X, 
  Download, 
  Upload, 
  DollarSign, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  FileSpreadsheet,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface B2bSheetsInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void;
}

export const B2bSheetsInstructionsModal: React.FC<B2bSheetsInstructionsModalProps> = ({
  isOpen,
  onClose,
  onDownloadTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">
                  Guia: Como Conectar sua Planilha no Google Sheets
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)]">
                  Siga os 4 passos rápidos abaixo para configurar e sincronizar seus preços de atacado.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-secondary)] hover:text-[var(--dash-text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Passos Ilustrados */}
          <div className="space-y-4">
            
            {/* Passo 1 */}
            <div className="p-4 rounded-xl bg-[var(--dash-surface-secondary)] border border-slate-200/80 dark:border-white/10 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-xs font-bold text-[var(--dash-text-primary)]">
                  Baixe a Planilha Modelo com seus Produtos
                </h4>
                <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
                  O arquivo já vem formatado com as colunas <code>PRODUTO</code>, <code>SKU (ID)</code>, <code>PREÇO SUGERIDO (VAREJO)</code> para ancoragem de mercado, e as tabelas de atacado (<code>VALOR 1</code>, <code>VALOR 2</code>, etc.).
                </p>
                <button
                  onClick={onDownloadTemplate}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Baixar Modelo Pré-Preenchido (.CSV)</span>
                </button>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="p-4 rounded-xl bg-[var(--dash-surface-secondary)] border border-slate-200/80 dark:border-white/10 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-xs font-bold text-[var(--dash-text-primary)]">
                  Importe no Google Sheets
                </h4>
                <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
                  Acesse <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline font-semibold inline-flex items-center gap-0.5">Google Sheets <ExternalLink size={11} /></a> ➔ Clique em <strong>Criar Planilha em Branco</strong> ➔ Menu <strong>Arquivo</strong> ➔ <strong>Importar</strong> ➔ Aba <strong>Fazer upload</strong> e selecione o arquivo CSV baixado.
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="p-4 rounded-xl bg-[var(--dash-surface-secondary)] border border-slate-200/80 dark:border-white/10 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-xs font-bold text-[var(--dash-text-primary)]">
                  Preencha o Preço Sugerido & Tabelas de Atacado
                </h4>
                <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
                  Defina o <code>PREÇO SUGERIDO (VAREJO)</code> para ancoragem de valor e os preços de atacado nas colunas ao lado (ex: <code>VALOR 1</code>, <code>Atacado</code>, etc.). O lojista verá automaticamente o desconto e a margem de lucro estimada!
                </p>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="p-4 rounded-xl bg-[var(--dash-surface-secondary)] border border-slate-200/80 dark:border-white/10 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-xs font-bold text-[var(--dash-text-primary)]">
                  Deixe a Planilha Pública e Sincronize
                </h4>
                <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
                  No Google Sheets, clique no botão <strong>Compartilhar</strong> (canto superior direito) ➔ Em "Acesso geral", mude para <strong>"Qualquer pessoa com o link"</strong> (modo Leitor) ➔ Copie o link completo, cole no campo do painel e clique em <strong>Sincronizar Planilha Agora</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
