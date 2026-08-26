"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShoppingBag, Sparkles, Building2 } from "lucide-react";
import { B2bRegisterModal } from "./B2bRegisterModal";
import { B2bFastOrderModal } from "./B2bFastOrderModal";

interface B2bClientCatalogWrapperProps {
  slug: string;
  products: any[];
}

export const B2bClientCatalogWrapper: React.FC<B2bClientCatalogWrapperProps> = ({ slug, products }) => {
  const [b2bToken, setB2bToken] = useState<string | null>(null);
  const [b2bClient, setB2bClient] = useState<any | null>(null);
  const [b2bPrices, setB2bPrices] = useState<Record<string, number>>({});
  const [priceKey, setPriceKey] = useState<string>("tabela_x");
  const [loading, setLoading] = useState<boolean>(false);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isFastOrderOpen, setIsFastOrderOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("b2b") || localStorage.getItem(`b2b_token_${slug}`);

    if (token) {
      setB2bToken(token);
      localStorage.setItem(`b2b_token_${slug}`, token);
      fetchB2bClient(token);
    }
  }, [slug]);

  const fetchB2bClient = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/b2b/clients?token=${token}`);
      const data = await res.json();
      if (data.success && data.client) {
        setB2bClient(data.client);
        setB2bPrices(data.prices || {});
        setPriceKey(data.priceKey || "tabela_x");
      } else {
        localStorage.removeItem(`b2b_token_${slug}`);
        setB2bToken(null);
        setB2bClient(null);
      }
    } catch (err) {
      console.error("Erro ao validar token B2B:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutB2b = () => {
    localStorage.removeItem(`b2b_token_${slug}`);
    setB2bToken(null);
    setB2bClient(null);
    window.location.href = `/${slug}`;
  };

  return (
    <div className="w-full">
      {/* Banner de Status B2B */}
      {b2bClient ? (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--dash-text-primary)]">
                  {b2bClient.company_name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                  B2B Logado
                </span>
              </div>
              <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
                Tabela de Preços Exclusiva: <strong className="text-emerald-400 font-semibold">{priceKey.toUpperCase().replace('_', ' ')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsFastOrderOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pedido em Lote B2B</span>
            </button>

            <button
              onClick={handleLogoutB2b}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-muted)] hover:text-rose-400 transition-all"
              title="Sair do modo B2B"
            >
              Sair B2B
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-2xl bg-[var(--dash-surface-element)] border border-[var(--dash-border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--dash-text-secondary)]">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>É um revendedor ou lojista parceiro?</span>
          </div>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quero ser Revendedor</span>
          </button>
        </div>
      )}

      {/* Modal de Registro Inbound */}
      <B2bRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        slug={slug}
      />

      {/* Modal de Compra em Lote B2B */}
      {b2bClient && (
        <B2bFastOrderModal
          isOpen={isFastOrderOpen}
          onClose={() => setIsFastOrderOpen(false)}
          products={products}
          b2bPrices={b2bPrices}
          clientToken={b2bToken || ''}
          companyName={b2bClient.company_name}
          slug={slug}
        />
      )}
    </div>
  );
};
