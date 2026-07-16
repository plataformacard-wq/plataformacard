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
    customSubtitle
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[27px] border shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
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
          {/* Switch de Disponibilidade */}
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/20 px-4 py-2 rounded-[27px] border border-[var(--dash-border)]">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${formAvailable ? 'text-emerald-500 font-extrabold' : 'text-slate-400'}`}>
              {formAvailable ? 'Disponível' : 'Indisponível'}
            </span>
            <button 
              type="button"
              onClick={() => setFormAvailable(!formAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${formAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Link de Cartão Público */}
          {selectedSeller && (
            <a 
              href={getPublicUrl(formSlug, customDomain, false, true)} 
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-[27px] bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20 shadow-sm"
            >
              <ExternalLink size={14} /> Cartão Virtual
            </a>
          )}
        </div>
      </div>
    </>
  );
}
