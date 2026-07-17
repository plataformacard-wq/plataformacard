import React from "react";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getPublicUrl } from "@/lib/utils/url";

export function VendedorHeaderControls(props: any) {
  const {
    selectedSeller,
    setView,
    formName,
    formAvailable,
    setFormAvailable,
    formSlug,
    customDomain,
    hideBackButton,
    customTitle,
    customSubtitle,
    isReadOnly = false,
  } = props;

  return (
    <>
      {!hideBackButton && (
        <button 
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-sm font-medium text-[var(--dash-text-secondary)] hover:text-primary transition-colors"
        >
          <ChevronLeft size={18} /> Voltar para a lista
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[27px] border shadow-sm backdrop-blur-md" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            {customTitle ? customTitle : (selectedSeller ? `Editando: ${formName}` : "Nova Ficha de Vendedor")}
          </h2>
          {(selectedSeller || customSubtitle) && (
            <p className="text-xs text-[var(--dash-text-muted)] mt-1">
              {customSubtitle ? customSubtitle : "Gerencie a disponibilidade e acesse o cartão virtual do vendedor sem sair desta página."}
            </p>
          )}
        </div>

        {/* Controles de Acesso Rápido */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Switch de Disponibilidade — visual premium */}
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
            formAvailable
              ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_0_rgba(34,197,94,0.15)]"
              : "bg-[var(--dash-surface-secondary)] border-[var(--dash-border)]"
          }`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-300 ${
              formAvailable ? "text-emerald-500" : "text-[var(--dash-text-muted)]"
            }`}>
              {formAvailable ? "Disponível" : "Indisponível"}
            </span>
            <button 
              type="button"
              onClick={() => setFormAvailable(!formAvailable)}
              disabled={isReadOnly}
              aria-label="Alternar disponibilidade"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              } ${formAvailable ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-[var(--dash-border)]"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] shadow-md transition-transform duration-300 ${formAvailable ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Link de Cartão Público — premium */}
          {selectedSeller && (
            <a 
              href={getPublicUrl(formSlug, customDomain, false, true)} 
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20 shadow-sm hover:bg-primary hover:text-white hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.4)] hover:border-primary active:scale-95 transition-all duration-200"
            >
              <ExternalLink size={14} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              Cartão Virtual
            </a>
          )}
        </div>
      </div>
    </>
  );
}
