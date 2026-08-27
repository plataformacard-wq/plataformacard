"use client";

import React, { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, Building2, Phone, FileText, Loader2, ArrowRight } from "lucide-react";

interface B2bRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export const B2bRegisterModal: React.FC<B2bRegisterModalProps> = ({
  isOpen,
  onClose,
  slug,
}) => {
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
          isDirectInvite: false,
        }),
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

  const handleResetAndClose = () => {
    setCnpj("");
    setCompanyName("");
    setWhatsapp("");
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md bg-[var(--public-card-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] rounded-[28px] shadow-2xl relative overflow-hidden"
        >
          {/* Header do Modal */}
          <div className="p-5 sm:p-6 border-b border-[var(--public-card-border)] flex items-center justify-between gap-4 bg-[var(--public-bg)]/40">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-[var(--public-text-main)] leading-tight">
                  Quero ser Revendedor
                </h3>
                <p className="text-xs text-[var(--public-text-dim)] mt-0.5 font-medium">
                  Preços e Condições Comerciais de Atacado
                </p>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-full hover:bg-[var(--public-bg)] text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] transition-colors shrink-0 cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--public-text-main)] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>CNPJ da Empresa:</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full text-xs rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--public-text-main)] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Razão Social / Nome Fantasia:</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full text-xs rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Sua Empresa LTDA"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--public-text-main)] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp do Responsável:</span>
                </label>
                <input
                  type="tel"
                  required
                  className="w-full text-xs rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs tracking-wide transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cadastrando Solicitação...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Solicitar Acesso Atacadista</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Tela de Retenção e Confirmação */
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[var(--public-text-main)]">
                  Solicitação Recebida!
                </h3>
                <p className="text-xs text-[var(--public-text-dim)] leading-relaxed max-w-sm mx-auto">
                  Nossos analistas comerciais estão preparando as condições e ofertas exclusivas para o perfil da sua empresa. Você receberá o link de acesso direto pelo WhatsApp.
                </p>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
