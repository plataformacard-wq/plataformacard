import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import UpgradeModal from "@/components/dashboard/upsell/UpgradeModal";

export default function SeoAiGenerator(props: any) {
  const {
    businessModel,
    orgName,
    setOrgName,
    businessNiche,
    setBusinessNiche,
    generating,
    handleGenerateAI,
    planSlug
  } = props;

  const { requestFeature, isOpen, closeModal, requestedFeature } = useFeatureGate(planSlug);

  const onGenerateClick = () => {
    requestFeature("ai_seo", () => {
      handleGenerateAI();
    });
  };

  return (
    <>
      <UpgradeModal
        isOpen={isOpen}
        onClose={closeModal}
        feature={requestedFeature}
      />
      <div className="rounded-[27px] border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--dash-text-secondary)" }}>Assistente Inteligente</h2>
        <div className="border rounded-[27px] p-5 space-y-4" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}>
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "var(--dash-border)" }}>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Sparkles size={20} className="text-emerald-500" />
            </div>
            <div>
              <span className="text-sm font-bold block" style={{ color: "var(--dash-text-primary)" }}>Gerador SEO Automático</span>
              <span className="text-[10px]" style={{ color: "var(--dash-text-muted)" }}>Sugerir títulos e descrições com IA</span>
            </div>
          </div>
          
          {/* Inputs & Action */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>
                  {businessModel === "B2C" ? "Nome profissional / Seu nome" : "Nome da empresa"}
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder={businessModel === "B2C" ? "Ex: Dr. João Silva" : "Ex: Maj Mobilidade"}
                  className="w-full px-4 py-2.5 rounded-lg border outline-none text-xs transition-all focus:border-emerald-500/50"
                  style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>
                  Ramo de Atuação
                </label>
                <input
                  type="text"
                  value={businessNiche}
                  onChange={(e) => setBusinessNiche(e.target.value)}
                  placeholder="Ex: Vestuário, Pizzaria, Advocacia"
                  className="w-full px-4 py-2.5 rounded-lg border outline-none text-xs transition-all focus:border-emerald-500/50"
                  style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex-1">
                {(!orgName.trim() || !businessNiche.trim()) ? (
                  <p className="text-[10px] font-bold text-amber-500/80 flex items-center gap-1 uppercase tracking-wider">
                    ⚠️ Preencha o nome e o ramo de atuação para liberar o assistente de IA
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                    ✨ Assistente liberado! Clique em Gerar Sugestões.
                  </p>
                )}
              </div>
              <button 
                onClick={onGenerateClick}
                disabled={!orgName.trim() || !businessNiche.trim() || generating}
                className="px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 shrink-0 shadow-md hover:shadow-lg active:scale-95"
                style={{ background: "var(--dash-text-primary)", color: "var(--dash-surface)" }}
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Gerar Sugestões</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
