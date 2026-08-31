"use client";

import React, { useState } from "react";
import { X, UserPlus, CheckCircle2, Copy, Send, Loader2, Search, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateCnpj, formatCnpj, fetchCnpjData } from "@/lib/utils/cnpj";

interface B2bNewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  customTables?: { key: string; label: string }[];
  onClientCreated: () => void;
}

export const B2bNewClientModal: React.FC<B2bNewClientModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  slug,
  customTables = [],
  onClientCreated,
}) => {
  const [cnpj, setCnpj] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [assignedPriceKey, setAssignedPriceKey] = useState("valor_1");
  const [anchorPercent, setAnchorPercent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjStatus, setCnpjStatus] = useState<{
    valid: boolean;
    active: boolean;
    message: string;
    cityState?: string;
  } | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCnpjChange = async (val: string) => {
    const formatted = formatCnpj(val);
    setCnpj(formatted);
    const clean = val.replace(/\D/g, "");

    if (clean.length === 14) {
      if (!validateCnpj(clean)) {
        setCnpjStatus({
          valid: false,
          active: false,
          message: "CNPJ inválido (dígitos verificadores incorretos).",
        });
        return;
      }

      // Consultar BrasilAPI
      setCnpjLoading(true);
      setCnpjStatus(null);
      const res = await fetchCnpjData(clean);
      setCnpjLoading(false);

      if (res.success && res.data) {
        setCompanyName(res.data.razaoSocial || "");
        if (res.data.nomeFantasia && res.data.nomeFantasia !== res.data.razaoSocial) {
          setTradeName(res.data.nomeFantasia);
        }
        if (res.data.telefone && !whatsapp) {
          setWhatsapp(res.data.telefone);
        }

        const cityState = res.data.cidade && res.data.uf ? `${res.data.cidade}/${res.data.uf}` : undefined;
        setCnpjStatus({
          valid: true,
          active: res.data.isAtiva,
          message: res.data.isAtiva
            ? "CNPJ Válido e Ativo na Receita Federal"
            : `Situação Cadastral: ${res.data.situacaoCadastral}`,
          cityState,
        });
      } else {
        setCnpjStatus({
          valid: true,
          active: true,
          message: "CNPJ válido (preencha a Razão Social manualmente).",
        });
      }
    } else {
      setCnpjStatus(null);
    }
  };

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
          tradeName: tradeName || undefined,
          phoneWhatsapp: whatsapp,
          assignedPriceKey,
          anchorPercent: anchorPercent.trim() !== "" ? Number(anchorPercent) : undefined,
          isDirectInvite: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.client) {
        setCreatedToken(data.client.access_token);
        onClientCreated();
      } else {
        alert(data.error || "Erro ao cadastrar cliente B2B.");
      }
    } catch (err) {
      alert("Erro de conexão ao cadastrar lojista.");
    } finally {
      setLoading(false);
    }
  };

  const getClientUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${slug}/catalogo?b2b_token=${token}`;
    }
    return `https://www.plataformashop.com.br/${slug}/catalogo?b2b_token=${token}`;
  };

  const handleCopyLink = () => {
    if (!createdToken) return;
    const url = getClientUrl(createdToken);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppSend = () => {
    if (!createdToken) return;
    const url = getClientUrl(createdToken);
    const msg = `Olá *${tradeName || companyName}*! 👋\n\nSeu acesso exclusivo ao catálogo B2B da *Maj Mobilidade* foi cadastrado e liberado!\n\nAcesse no link seguro:\n${url}`;
    const cleanPhone = whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleResetAndClose = () => {
    setCnpj("");
    setCompanyName("");
    setTradeName("");
    setWhatsapp("");
    setAssignedPriceKey("valor_1");
    setAnchorPercent("");
    setCnpjStatus(null);
    setCreatedToken(null);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] shadow-xl relative space-y-4"
        >
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-secondary)] hover:text-[var(--dash-text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--dash-text-primary)]">
                Cadastrar Lojista B2B
              </h3>
              <p className="text-xs text-[var(--dash-text-muted)]">
                Convite Direto Pré-Configurado (Outbound)
              </p>
            </div>
          </div>

          {!createdToken ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--dash-text-primary)]">
                    CNPJ / CPF do Lojista:
                  </label>
                  {cnpjLoading && (
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Consultando Receita...</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={18}
                    className="w-full text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    placeholder="Ex: 00.000.000/0001-00"
                    value={cnpj}
                    onChange={(e) => handleCnpjChange(e.target.value)}
                  />
                  {cnpjStatus?.valid && (
                    <div className="absolute right-3 top-2.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </div>

                {/* Badge de Status da Receita Federal */}
                {cnpjStatus && (
                  <div
                    className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                      cnpjStatus.active
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {cnpjStatus.active ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span>{cnpjStatus.message} {cnpjStatus.cityState ? `• ${cnpjStatus.cityState}` : ""}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--dash-text-primary)]">
                  Razão Social:
                </label>
                <input
                  type="text"
                  required
                  className="w-full text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="Ex: Mobilidade Urbana LTDA"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--dash-text-primary)]">
                  Nome Fantasia (Opcional):
                </label>
                <input
                  type="text"
                  className="w-full text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="Ex: Loja de Motos BH"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--dash-text-primary)]">
                  WhatsApp com DDD:
                </label>
                <input
                  type="tel"
                  required
                  className="w-full text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                  placeholder="Ex: (31) 99999-8888"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--dash-text-primary)]">
                  Tabela de Preço Atribuída:
                </label>
                <select
                  className="dash-select w-full text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] pl-3 py-2.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                  value={assignedPriceKey}
                  onChange={(e) => setAssignedPriceKey(e.target.value)}
                >
                  {customTables.length > 0 ? (
                    customTables.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="valor_1">Tabela 1 (Valor 1)</option>
                      <option value="valor_2">Tabela 2 (Valor 2)</option>
                      <option value="valor_3">Tabela 3 (Valor 3)</option>
                      <option value="valor_4">Tabela 4 (Valor 4)</option>
                    </>
                  )}
                  <option value="bling">Preço Base (Bling / Catálogo)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--dash-text-primary)]">
                    % de Ancoragem / Markup Sugerido:
                  </label>
                  <span className="text-[10px] text-[var(--dash-text-muted)]">Opcional (padrão da loja: 30%)</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="500"
                    className="w-full text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-3.5 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    placeholder="Ex: 30 (Gera +30% de preço sugerido riscado)"
                    value={anchorPercent}
                    onChange={(e) => setAnchorPercent(e.target.value)}
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-[var(--dash-text-muted)] font-mono font-semibold">%</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-200/60 dark:border-white/5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-[var(--dash-surface-secondary)] text-[var(--dash-text-secondary)] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (cnpjStatus !== null && !cnpjStatus.valid)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Cadastrando..." : "Cadastrar & Gerar Link"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-lg text-[var(--dash-text-primary)]">
                  Lojista Cadastrado com Sucesso!
                </h4>
                <p className="text-xs text-[var(--dash-text-secondary)] max-w-sm mx-auto">
                  O link exclusivo com token foi gerado e está pronto para envio.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--dash-surface-secondary)] border border-slate-200/80 dark:border-white/10 text-xs font-mono text-[var(--dash-text-muted)] break-all text-left">
                {getClientUrl(createdToken)}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className={`w-full py-2.5 px-3.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    copied
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] hover:border-emerald-500/30"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Link Exclusivo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleWhatsAppSend}
                  className="w-full py-2.5 px-3.5 text-xs font-semibold rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Convite pelo WhatsApp</span>
                </button>
              </div>

              <button
                onClick={handleResetAndClose}
                className="text-xs text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] font-semibold transition-colors pt-1 block mx-auto cursor-pointer"
              >
                Concluir e Fechar
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
