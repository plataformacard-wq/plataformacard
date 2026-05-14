"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, AlertCircle, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';

interface AiReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (acceptedFields: Record<string, boolean>) => void;
  title: string;
  explanation: string;
  original?: string;
  proposed?: string;
  changes?: { id: string; field: string; from: string; to: string }[];
}

export default function AiReviewModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  explanation, 
  original, 
  proposed,
  changes 
}: AiReviewModalProps) {
  const [acceptedFields, setAcceptedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, boolean> = {};
      if (changes) {
        changes.forEach(c => { initial[c.id] = true; });
      } else {
        initial['single'] = true;
      }
      setAcceptedFields(initial);
    }
  }, [isOpen, changes]);

  if (!isOpen) return null;

  const toggleField = (id: string) => {
    setAcceptedFields(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--dash-border)] flex items-center justify-between bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--dash-text-primary)]">{title}</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Revisão Sugerida pela IA</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--dash-hover-bg)] rounded-xl transition-colors text-[var(--dash-text-muted)]">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Explanation Card */}
            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
              <div className="text-blue-500 mt-1">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">O que a IA fez:</p>
                <p className="text-sm font-bold text-[var(--dash-text-secondary)] leading-relaxed">
                  {explanation}
                </p>
              </div>
            </div>

            {/* Comparison Section */}
            {changes ? (
              <div className="space-y-6">
                {changes.map((change, i) => (
                  <div key={i} className={`space-y-3 p-4 rounded-3xl border-2 transition-all ${acceptedFields[change.id] ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-zinc-500/10 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">{change.field}</p>
                      <button 
                        onClick={() => toggleField(change.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${acceptedFields[change.id] ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}
                      >
                        {acceptedFields[change.id] ? <><Check size={12}/> Sugestão Aceita</> : <><X size={12}/> Manter Original</>}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div className="p-4 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-border)] opacity-50 overflow-hidden">
                        {change.field === 'Descrição' ? (
                          <div className="text-[10px] opacity-70 line-through max-h-20 overflow-hidden text-[var(--dash-text-muted)]" dangerouslySetInnerHTML={{ __html: change.from || '' }} />
                        ) : (
                          <p className="text-xs font-medium text-[var(--dash-text-muted)] line-through">{change.from || '(Vazio)'}</p>
                        )}
                      </div>
                      <div className={`flex justify-center rotate-90 md:rotate-0 transition-colors ${acceptedFields[change.id] ? 'text-emerald-500' : 'text-zinc-300'}`}>
                        <ArrowRight size={20} />
                      </div>
                      <div className={`p-4 rounded-xl border overflow-hidden transition-all ${acceptedFields[change.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-100 border-zinc-200 opacity-30'}`}>
                        {change.field === 'Descrição' ? (
                          <div className="text-[10px] font-bold max-h-32 overflow-y-auto custom-scrollbar text-[var(--dash-text-primary)]" dangerouslySetInnerHTML={{ __html: change.to }} />
                        ) : (
                          <p className="text-xs font-bold text-[var(--dash-text-primary)]">{change.to}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Texto Atual</p>
                  <div 
                    className="p-5 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-border)] text-sm font-medium opacity-50 h-[250px] overflow-y-auto custom-scrollbar"
                    style={{ color: "var(--dash-text-secondary)" }}
                    dangerouslySetInnerHTML={{ __html: original || '' }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sugestão da IA</p>
                    <button 
                      onClick={() => toggleField('single')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${acceptedFields['single'] ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}
                    >
                      {acceptedFields['single'] ? <><Check size={12}/> Sugestão Aceita</> : <><X size={12}/> Manter Original</>}
                    </button>
                  </div>
                  <div 
                    className={`p-5 rounded-2xl border text-sm transition-all h-[250px] overflow-y-auto custom-scrollbar ${acceptedFields['single'] ? 'bg-emerald-500/[0.03] border-emerald-500/20 font-bold text-[var(--dash-text-primary)]' : 'bg-zinc-100 border-zinc-200 opacity-30'}`}
                    dangerouslySetInnerHTML={{ __html: proposed || '' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-[var(--dash-border)] flex items-center justify-end gap-4 bg-[var(--dash-surface)]">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] transition-colors"
            >
              Recusar Tudo
            </button>
            <button 
              onClick={() => onConfirm(acceptedFields)}
              className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Check size={18} /> Aceitar Sugestões Selecionadas
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
