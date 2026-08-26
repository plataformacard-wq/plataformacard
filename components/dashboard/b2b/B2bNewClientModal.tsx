"use client";

import React, { useState } from "react";
import { X, UserPlus, Send, Copy, Check } from "lucide-react";

interface B2bNewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  onClientCreated: () => void;
}

export const B2bNewClientModal: React.FC<B2bNewClientModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  slug,
  onClientCreated
}) => {
  const [cnpj, setCnpj] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [assignedPriceKey, setAssignedPriceKey] = useState("tabela_x");
  const [loading, setLoading] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
          organizationId,
          slug,
          cnpjCpf: cnpj,
          companyName,
          tradeName: tradeName || companyName,
          phoneWhatsapp: whatsapp,
          assignedPriceKey,
          isDirectInvite: true
        })
      });

      const data = await res.json();
      if (data.success && data.client) {
        setCreatedToken(data.client.access_token);
        onClientCreated();
      } else {
        alert(data.error || "Erro ao cadastrar cliente B2B.");
      }
    } catch (err: any) {
      alert("Erro de conexão ao criar cliente.");
    } finally {
      setLoading(false);
    }
  };

  const getClientUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${slug}?b2b=${token}`;
    }
    return `https://www.plataformashop.com.br/${slug}?b2b=${token}`;
  };

  const handleCopy = () => {
    if (!createdToken) return;
    navigator.clipboard.writeText(getClientUrl(createdToken));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppSend = () => {
    if (!createdToken) return;
    const url = getClientUrl(createdToken);
    const msg = `Olá *${tradeName || companyName}*! 👋\n\nSeu acesso exclusivo ao catálogo B2B da *Maj Mobilidade* foi cadastrado e liberado!\n\nAcesse no link abaixo:\n${url}`;
    const cleanPhone = whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-element)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-[var(--dash-text-primary)]">
              Cadastrar Novo Lojista B2B
            </h3>
            <p className="text-xs text-[var(--dash-text-muted)]">
              Fluxo A: Convite Direto Pré-Configurado (Outbound)
            </p>
          </div>
        </div>

        {!createdToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                CNPJ / CPF do Cliente:
              </label>
              <input
                type="text"
                required
                className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                placeholder="Ex: 12.345.678/0001-90"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                Razão Social:
              </label>
              <input
                type="text"
                required
                className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                placeholder="Ex: Mobilidade Urbana LTDA"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                Nome Fantasia (Opcional):
              </label>
              <input
                type="text"
                className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                placeholder="Ex: Loja de Mobilidade BH"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                WhatsApp com DDD:
              </label>
              <input
                type="text"
                required
                className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                placeholder="Ex: (31) 99999-8888"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
                Tabela de Preço Atribuída:
              </label>
              <select
                className="dash-select w-full text-xs font-semibold rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] pl-3 py-2 focus:outline-none"
                value={assignedPriceKey}
                onChange={(e) => setAssignedPriceKey(e.target.value)}
              >
                <option value="tabela_x">Tabela X (VIP)</option>
                <option value="tabela_y">Tabela Y (Margem Ajustada)</option>
                <option value="tabela_z">Tabela Z (Plus / Atacado)</option>
                <option value="bling">Preço Base (Bling)</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[var(--dash-border-subtle)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--dash-border-subtle)] hover:bg-[var(--dash-surface-element)] text-[var(--dash-text-secondary)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? "Cadastrando..." : "Cadastrar & Liberar Link"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
              <p className="font-semibold text-sm">Cliente Cadastrado com Sucesso!</p>
              <p className="text-xs opacity-80">Link de acesso exclusivo em 1 clique gerado com a tabela selecionada.</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--dash-surface-element)] text-xs font-mono text-[var(--dash-text-primary)] break-all border border-[var(--dash-border-subtle)]">
              {getClientUrl(createdToken)}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] hover:border-emerald-500/50 flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copiado!" : "Copiar Link"}</span>
              </button>

              <button
                onClick={handleWhatsAppSend}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => {
                setCreatedToken(null);
                onClose();
              }}
              className="w-full mt-2 text-xs text-[var(--dash-text-muted)] hover:underline"
            >
              Concluir e Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
