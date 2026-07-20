"use client";

import React, { useState } from "react";
import { X, User, Phone, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { updateLeadDetails, closeLeadWithStockDeduction } from "@/app/dashboard/crm/actions";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number | null;
}

interface Lead {
  id: string;
  product_name: string | null;
  seller_name: string | null;
  client_name: string | null;
  client_whatsapp: string | null;
  notes: string | null;
  crm_status: "new_lead" | "open" | "negotiating" | "closed";
  created_at: string;
  product_id?: string | null;
  stock_deducted?: number | null;
}

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  products: Product[];
  onLeadUpdated: (updatedLead: Lead) => void;
}

export default function LeadDetailModal({
  isOpen,
  onClose,
  lead,
  products,
  onLeadUpdated,
}: LeadDetailModalProps) {
  const [clientName, setClientName] = useState(lead.client_name || "");
  const [clientWhatsapp, setClientWhatsapp] = useState(lead.client_whatsapp || "");
  const [notes, setNotes] = useState(lead.notes || "");
  
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isClosingDeal, setIsClosingDeal] = useState(false);

  // Estados de Fechamento de Negócio (Desconto de Estoque)
  const [showCloseOptions, setShowCloseOptions] = useState(lead.crm_status === "closed");
  const [selectedProductId, setSelectedProductId] = useState<string>(
    lead.product_id || 
    products.find((p) => p.name.toLowerCase() === lead.product_name?.toLowerCase())?.id || 
    ""
  );
  const [deductQuantity, setDeductQuantity] = useState<number>(lead.stock_deducted || 1);

  if (!isOpen) return null;

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    try {
      const res = await updateLeadDetails(lead.id, clientName, clientWhatsapp, notes);
      if (res.success) {
        onLeadUpdated({
          ...lead,
          client_name: clientName,
          client_whatsapp: clientWhatsapp,
          notes,
        });
        alert("Detalhes atualizados com sucesso!");
      } else {
        alert("Erro ao salvar detalhes: " + res.error);
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleCloseDealSubmit = async () => {
    setIsClosingDeal(true);
    try {
      const res = await closeLeadWithStockDeduction(
        lead.id,
        selectedProductId || null,
        deductQuantity,
        notes
      );
      if (res.success) {
        onLeadUpdated({
          ...lead,
          crm_status: "closed",
          client_name: clientName,
          client_whatsapp: clientWhatsapp,
          notes,
          product_id: selectedProductId,
          stock_deducted: deductQuantity,
        });
        alert("Negócio fechado e estoque atualizado!");
        onClose();
      } else {
        alert("Erro ao fechar negócio: " + res.error);
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
    } finally {
      setIsClosingDeal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header do Modal */}
        <div className="p-6 border-b border-[var(--dash-border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              Detalhes do Lead
            </span>
            <h2 className="text-xl font-bold text-[var(--dash-text-primary)] mt-1">
              {lead.product_name || "Interesse de Compra"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)] rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações Básicas do Lead */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--dash-hover-bg)]/40 border border-[var(--dash-border)] rounded-2xl">
            <div>
              <p className="text-xs text-[var(--dash-text-muted)] font-black uppercase">Vendedor</p>
              <p className="text-sm font-bold text-[var(--dash-text-primary)] mt-1">
                {lead.seller_name || "Central da Loja"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--dash-text-muted)] font-black uppercase">Iniciado em</p>
              <p className="text-sm font-bold text-[var(--dash-text-primary)] mt-1">
                {new Date(lead.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Ficha do Cliente */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--dash-text-muted)]">
              Ficha do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--dash-text-secondary)] flex items-center gap-1.5">
                  <User size={14} className="text-primary" /> Nome do Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-[var(--dash-text-primary)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--dash-text-secondary)] flex items-center gap-1.5">
                  <Phone size={14} className="text-primary" /> WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Ex: 11999999999"
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-[var(--dash-text-primary)] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--dash-text-secondary)] flex items-center gap-1.5">
                <FileText size={14} className="text-primary" /> Anotações / Histórico de Negociação
              </label>
              <textarea
                placeholder="Detalhes adicionais da conversa..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-[var(--dash-text-primary)] resize-none transition-all"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={isSavingDetails}
                className="px-6 py-2.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] hover:bg-[var(--dash-surface)] text-xs font-black uppercase tracking-widest text-[var(--dash-text-primary)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSavingDetails && <Loader2 size={14} className="animate-spin" />}
                Salvar Ficha
              </button>
            </div>
          </div>

          {/* Seção de Baixa de Estoque para Negócio Fechado */}
          <div className="pt-6 border-t border-[var(--dash-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--dash-text-muted)]">
                Opções de Fechamento de Venda
              </h3>
              {lead.crm_status !== "closed" && (
                <button
                  type="button"
                  onClick={() => setShowCloseOptions(!showCloseOptions)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    showCloseOptions
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {showCloseOptions ? "Cancelar" : "Fechar Negócio"}
                </button>
              )}
            </div>

            {showCloseOptions && (
              <div className="p-5 border border-emerald-500/20 bg-emerald-500/[0.03] rounded-2xl space-y-4 animate-slideDown">
                <p className="text-xs text-[var(--dash-text-muted)] leading-relaxed">
                  Para registrar a venda e abater unidades do produto selecionado no seu estoque
                  automática ou manualmente, preencha os dados abaixo:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-[var(--dash-text-secondary)]">
                      Vincular ao Produto
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      disabled={lead.crm_status === "closed"}
                      className="dash-select w-full border border-[var(--dash-border)] pl-4 py-2.5 rounded-xl bg-[var(--dash-surface)] text-sm font-medium text-[var(--dash-text-primary)] outline-none"
                    >
                      <option value="">Não vincular / Não abater estoque</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} {prod.sku ? `(SKU: ${prod.sku})` : ""} — {prod.stock_quantity ?? 0} un em estoque
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--dash-text-secondary)]">
                      Qtd. a Descontar
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={deductQuantity}
                      onChange={(e) => setDeductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={lead.crm_status === "closed" || !selectedProductId}
                      className="w-full px-4 py-2.5 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-bold text-center text-[var(--dash-text-primary)]"
                    />
                  </div>
                </div>

                {lead.crm_status !== "closed" && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleCloseDealSubmit}
                      disabled={isClosingDeal}
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isClosingDeal ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Confirmar Fechamento de Negócio
                    </button>
                  </div>
                )}

                {lead.crm_status === "closed" && lead.stock_deducted && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
                    <CheckCircle2 size={16} />
                    Negócio Fechado: foram descontados {lead.stock_deducted} item(ns) do produto
                    vinculado.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
