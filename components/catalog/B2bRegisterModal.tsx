"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, Building2 } from "lucide-react";

interface B2bRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export const B2bRegisterModal: React.FC<B2bRegisterModalProps> = ({ isOpen, onClose, slug }) => {
  const [cnpj, setCnpj] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnpj || !companyName || !whatsapp) return;

    setLoading(true);
    try {
      const res = await fetch("/api/b2b/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          cnpjCpf: cnpj,
          companyName,
          phoneWhatsapp: whatsapp,
          isDirectInvite: false // Solicitação Inbound B2B
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert(data.error || "Erro ao enviar solicitação.");
      }
    } catch (err) {
      alert("Erro de conexão ao enviar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl border border-emerald-500/30 bg-[var(--dash-surface)] shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-element)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">
                  Quero ser Revendedor B2B
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)]">
                  Maj Mobilidade • Preços e Condições de Atacado
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                CNPJ da Empresa:
              </label>
              <input
                type="text"
                required
                className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                placeholder="00.000.000/0001-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                Razão Social / Nome da Empresa:
              </label>
              <input
                type="text"
                required
                className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                placeholder="Sua Empresa LTDA"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                WhatsApp de Contato:
              </label>
              <input
                type="text"
                required
                className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                placeholder="(00) 90000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Enviando..." : "Solicitar Acesso B2B"}</span>
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">
                Solicitação Recebida com Sucesso!
              </h3>
              <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed px-2">
                Nossos analistas da <strong>Maj Mobilidade</strong> estão preparando ofertas e condições especiais para o perfil da sua empresa. Você receberá um aviso no seu WhatsApp em instantes com o seu link de acesso liberado.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] border border-[var(--dash-border-subtle)] hover:border-emerald-500/50"
            >
              Entendido e Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
