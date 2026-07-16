"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { fixSingleFieldOrthography, regenerateDescriptionFallback } from '@/lib/ai-actions';
import { Spec } from "@/types";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface AiReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (acceptedFields: Record<string, boolean>, editedValues: Record<string, string>) => void;
  title: string;
  explanation: string;
  original?: string;
  proposed?: string;
  changes?: { id: string; field: string; from: string; to: string }[];
  contextData?: { name: string; specs: Spec[] };
}

export default function AiReviewModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  explanation, 
  original, 
  proposed,
  changes,
  contextData
}: AiReviewModalProps) {
  const [acceptedFields, setAcceptedFields] = useState<Record<string, boolean>>({});
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [fixingField, setFixingField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialAccepted: Record<string, boolean> = {};
      const initialEdited: Record<string, string> = {};
      if (changes) {
        changes.forEach(c => { 
          initialAccepted[c.id] = true; 
          initialEdited[c.id] = c.to;
        });
      } else {
        initialAccepted['single'] = true;
        initialEdited['single'] = proposed || '';
      }
      setAcceptedFields(initialAccepted);
      setEditedValues(initialEdited);
      setFixingField(null);
    }
  }, [isOpen, changes, proposed]);

  const handleFixSingleField = async (id: string, text: string, type: 'name' | 'highlight' | 'description') => {
    setFixingField(id);
    try {
      const res = await fixSingleFieldOrthography(text, type);
      if (res.success && res.data) {
        setEditedValues(prev => ({ ...prev, [id]: res.data }));
      } else {
        alert(res.error || "Erro ao corrigir campo.");
      }
    } catch (e: any) {
      alert("Erro ao corrigir: " + e.message);
    } finally {
      setFixingField(null);
    }
  };

  const handleRegenerateDescription = async (id: string) => {
    if (!contextData) return alert("Faltam dados de contexto para regerar a descrição.");
    setFixingField(id);
    try {
      const res = await regenerateDescriptionFallback(contextData.name, contextData.specs);
      if (res.success && res.data) {
        setEditedValues(prev => ({ ...prev, [id]: res.data }));
      } else {
        alert(res.error || "Erro ao regerar descrição.");
      }
    } catch (e: any) {
      alert("Erro ao regerar: " + e.message);
    } finally {
      setFixingField(null);
    }
  };

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
          className="relative w-full max-w-2xl bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--dash-border)] flex items-center justify-between bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[var(--dash-text-primary)]">{title}</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Revisão Sugerida pela IA</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--dash-hover-bg)] rounded-lg transition-colors text-[var(--dash-text-muted)]">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">


            {/* Comparison Section */}
            {changes ? (
              <div className="space-y-6">
                {changes.map((change, i) => (
                  <div key={i} className={`space-y-3 p-4 rounded-[27px] border-2 transition-all ${acceptedFields[change.id] ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-zinc-500/10 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">{change.field}</p>
                      <button 
                        onClick={() => toggleField(change.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${acceptedFields[change.id] ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}
                      >
                        {acceptedFields[change.id] ? <><Check size={12}/> Sugestão Aceita</> : <><X size={12}/> Manter Original</>}
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="relative p-4 rounded-lg bg-[var(--dash-bg)] border border-[var(--dash-border)] opacity-60 overflow-hidden">
                        <span className="absolute top-2 right-3 text-[8px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Original</span>
                        {change.field === 'Descrição' || change.field === 'Ficha Técnica' ? (
                          <div className="text-[10px] opacity-70 line-through max-h-20 overflow-hidden text-[var(--dash-text-muted)] pt-3" dangerouslySetInnerHTML={{ __html: change.from || '' }} />
                        ) : (
                          <p className="text-xs font-medium text-[var(--dash-text-muted)] line-through pt-2">{change.from || '(Vazio)'}</p>
                        )}
                      </div>
                      <div className={`relative p-4 rounded-lg border transition-all ${acceptedFields[change.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-100 border-zinc-200 opacity-40'}`}>
                        <span className={`absolute top-2 right-3 text-[8px] font-black uppercase tracking-widest ${acceptedFields[change.id] ? 'text-emerald-500' : 'text-zinc-400'}`}>
                          Sugerido
                        </span>
                        {change.field !== 'Ficha Técnica' && acceptedFields[change.id] && (
                          <button
                            onClick={() => {
                              let type: 'name' | 'highlight' | 'description' = 'name';
                              if (change.field === 'Destaque') type = 'highlight';
                              if (change.field === 'Descrição') type = 'description';
                              handleFixSingleField(change.id, editedValues[change.id] || '', type);
                            }}
                            disabled={fixingField === change.id}
                            title="Corrigir ortografia deste texto"
                            className="absolute top-1.5 right-16 p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition-colors disabled:opacity-50"
                          >
                            {fixingField === change.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          </button>
                        )}
                        <div className="pt-4">
                          {change.field === 'Ficha Técnica' ? (
                            <div className="text-[11px] font-bold max-h-48 overflow-y-auto custom-scrollbar text-[var(--dash-text-primary)]" dangerouslySetInnerHTML={{ __html: editedValues[change.id] || '' }} />
                          ) : change.field === 'Descrição' ? (
                            <div className={acceptedFields[change.id] ? "" : "pointer-events-none opacity-50"}>
                              {(!editedValues[change.id] || editedValues[change.id].trim() === '' || editedValues[change.id] === '<p><br></p>') ? (
                                <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/5 rounded-lg border border-dashed border-emerald-500/20">
                                  <p className="text-xs text-[var(--dash-text-secondary)] mb-3 text-center font-medium">
                                    A IA não conseguiu gerar a descrição para este produto usando as regras avançadas.
                                  </p>
                                  <button
                                    onClick={() => handleRegenerateDescription(change.id)}
                                    disabled={fixingField === change.id}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                  >
                                    {fixingField === change.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    Gerar Usando Modo de Segurança
                                  </button>
                                </div>
                              ) : (
                                <ReactQuill 
                                  theme="snow"
                                  value={editedValues[change.id] || ''} 
                                  onChange={(val) => setEditedValues(prev => ({ ...prev, [change.id]: val }))}
                                  className="quill-premium !border-none"
                                  modules={{ toolbar: [ ['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}] ] }}
                                />
                              )}
                            </div>
                          ) : (
                            <textarea
                              value={editedValues[change.id] || ''}
                              onChange={(e) => setEditedValues(prev => ({ ...prev, [change.id]: e.target.value }))}
                              disabled={!acceptedFields[change.id]}
                              className="w-full bg-transparent border-none focus:outline-none resize-none text-sm font-bold text-[var(--dash-text-primary)] disabled:opacity-50 custom-scrollbar"
                              rows={2}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Texto Atual (Original)</p>
                  <div 
                    className="p-5 rounded-[27px] bg-[var(--dash-bg)] border border-[var(--dash-border)] text-sm font-medium opacity-60 max-h-[150px] overflow-y-auto custom-scrollbar"
                    style={{ color: "var(--dash-text-secondary)" }}
                    dangerouslySetInnerHTML={{ __html: original || '' }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sugestão da IA</p>
                    <div className="flex items-center gap-4">
                      {acceptedFields['single'] && (
                        <button
                          onClick={() => handleFixSingleField('single', editedValues['single'] || '', 'description')}
                          disabled={fixingField === 'single'}
                          title="Corrigir ortografia deste texto"
                          className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-500 transition-colors disabled:opacity-50"
                        >
                          {fixingField === 'single' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        </button>
                      )}
                      <button 
                        onClick={() => toggleField('single')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${acceptedFields['single'] ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}
                      >
                        {acceptedFields['single'] ? <><Check size={12}/> Sugestão Aceita</> : <><X size={12}/> Manter Original</>}
                      </button>
                    </div>
                  </div>
                  <div className={`p-4 rounded-[27px] border transition-all ${acceptedFields['single'] ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 'bg-zinc-100 border-zinc-200 opacity-40'}`}>
                    <div className={acceptedFields['single'] ? "" : "pointer-events-none opacity-50"}>
                      {(!editedValues['single'] || editedValues['single'].trim() === '' || editedValues['single'] === '<p><br></p>') ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/5 rounded-lg border border-dashed border-emerald-500/20">
                          <p className="text-xs text-[var(--dash-text-secondary)] mb-3 text-center font-medium">
                            A IA não conseguiu gerar a descrição para este produto usando as regras avançadas.
                          </p>
                          <button
                            onClick={() => handleRegenerateDescription('single')}
                            disabled={fixingField === 'single'}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                          >
                            {fixingField === 'single' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Gerar Usando Modo de Segurança
                          </button>
                        </div>
                      ) : (
                        <ReactQuill 
                          theme="snow"
                          value={editedValues['single'] || ''} 
                          onChange={(val) => setEditedValues(prev => ({ ...prev, ['single']: val }))}
                          className="quill-premium !border-none"
                          modules={{ toolbar: [ ['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}] ] }}
                        />
                      )}
                    </div>
                  </div>
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
              onClick={() => onConfirm(acceptedFields, editedValues)}
              className="px-8 py-4 bg-emerald-500 text-white rounded-[27px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Check size={18} /> Aceitar Sugestões Selecionadas
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
