"use client";

import { useState, useEffect } from "react";
import { Settings, MessageSquare, Percent, ToggleLeft, ToggleRight, Loader2, Sparkles, Package, Save } from "lucide-react";

interface MasterCatalog {
  id: string;
  name: string;
  description: string | null;
  type?: "product" | "service" | "hybrid" | null;
  whatsapp_template?: string | null;
  hide_cta?: boolean | null;
}

interface CaasConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    type: "product" | "service" | "hybrid";
    whatsappTemplate: string;
    hideCta: boolean;
  }) => Promise<void>;
  catalog: MasterCatalog | null;
  savingConfig: boolean;
  loadingConfigData: boolean;
  configCategoriesCount: number;
  configProductsCount: number;
  onOpenBulkPromo: () => void;
}

export default function CaasConfigModal({
  isOpen,
  onClose,
  onSave,
  catalog,
  savingConfig,
  loadingConfigData,
  configCategoriesCount,
  configProductsCount,
  onOpenBulkPromo,
}: CaasConfigModalProps) {
  const [configTab, setConfigTab] = useState<"geral" | "mensagem" | "reajustes">("geral");
  const [configName, setConfigName] = useState("");
  const [configDesc, setConfigDesc] = useState("");
  const [configType, setConfigType] = useState<"product" | "service" | "hybrid">("product");
  const [configWhatsappTemplate, setConfigWhatsappTemplate] = useState("");
  const [configHideCta, setConfigHideCta] = useState(false);

  useEffect(() => {
    if (isOpen && catalog) {
      setConfigName(catalog.name || "");
      setConfigDesc(catalog.description || "");
      setConfigType(catalog.type || "product");
      setConfigWhatsappTemplate(catalog.whatsapp_template || "");
      setConfigHideCta(!!catalog.hide_cta);
      setConfigTab("geral");
    }
  }, [isOpen, catalog]);

  if (!isOpen || !catalog) return null;

  const handleSave = () => {
    onSave({
      name: configName,
      description: configDesc,
      type: configType,
      whatsappTemplate: configWhatsappTemplate,
      hideCta: configHideCta,
    });
  };

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div 
        className="w-full max-w-4xl overflow-hidden rounded-[40px] border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ 
          background: "var(--dash-surface)", 
          borderColor: "var(--dash-border)",
          color: "var(--dash-text-primary)"
        }}
      >
        {/* Header */}
        <div className="p-8 border-b flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Configurações do Catálogo Master</h2>
              <p className="text-xs text-[var(--dash-text-muted)] font-medium">Gerencie a identidade, CTAs e descontos do estoque mestre.</p>
            </div>
          </div>

          {/* Tabs Navigation (Estilo B2B) */}
          <div className="flex bg-[var(--dash-hover-bg)] p-1 rounded-lg border border-[var(--dash-border)]">
            <button
              onClick={() => setConfigTab("geral")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-black text-[10px] uppercase tracking-widest transition-all ${configTab === "geral" ? "bg-white text-black shadow-md" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
            >
              Geral
            </button>
            <button
              onClick={() => setConfigTab("mensagem")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-black text-[10px] uppercase tracking-widest transition-all ${configTab === "mensagem" ? "bg-white text-black shadow-md" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
            >
              Mensagem
            </button>
            <button
              onClick={() => setConfigTab("reajustes")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-black text-[10px] uppercase tracking-widest transition-all ${configTab === "reajustes" ? "bg-white text-black shadow-md" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
            >
              Reajustes
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {configTab === "geral" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Nome do Catálogo</label>
                  <input 
                    type="text" 
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                    style={{ color: "var(--dash-text-primary)" }}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Descrição (SEO)</label>
                  <input 
                    type="text" 
                    value={configDesc}
                    onChange={(e) => setConfigDesc(e.target.value)}
                    className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                    style={{ color: "var(--dash-text-primary)" }}
                  />
                </div>
              </div>

              {/* Tipo de Catálogo */}
              <div className="space-y-3 pt-4 border-t border-[var(--dash-border)]">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                  <Sparkles size={12} className="text-purple-500" /> Tipo de Catálogo
                </label>
                <div className="flex p-1.5 rounded-[20px] bg-[var(--dash-hover-bg)] border border-[var(--dash-border)]">
                  <button
                    onClick={() => setConfigType("product")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${configType === "product" ? "bg-white text-black shadow-sm" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                  >
                    <Package size={14} /> Produto
                  </button>
                  <button
                    onClick={() => setConfigType("service")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${configType === "service" ? "bg-white text-black shadow-sm" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                  >
                    <Settings size={14} /> Serviço
                  </button>
                  <button
                    onClick={() => setConfigType("hybrid")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${configType === "hybrid" ? "bg-white text-black shadow-sm" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                  >
                    <Sparkles size={14} /> Híbrido
                  </button>
                </div>
              </div>

              {/* Toggle Habilitar CTA */}
              <div className="pt-6 border-t border-[var(--dash-border)] flex items-center justify-between bg-purple-500/5 border border-purple-500/10 p-5 rounded-lg">
                <div>
                  <h4 className="text-sm font-bold text-[var(--dash-text-primary)]">Habilitar Botões de WhatsApp (CTA)</h4>
                  <p className="text-xs text-[var(--dash-text-muted)] mt-1 max-w-lg">
                    Se ativado, exibe os botões de pedido direto no WhatsApp. Desative para transformar o catálogo em uma vitrine puramente de consulta visual.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setConfigHideCta(!configHideCta)}
                  className={`text-purple-500 hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                >
                  {configHideCta ? (
                    <ToggleLeft size={44} className="text-zinc-500" />
                  ) : (
                    <ToggleRight size={44} className="text-purple-500" />
                  )}
                </button>
              </div>
            </div>
          )}

          {configTab === "mensagem" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                  <MessageSquare size={14} className="text-purple-500" /> Modelo de Mensagem (WhatsApp template)
                </label>
              </div>
              <textarea
                value={configWhatsappTemplate}
                onChange={(e) => setConfigWhatsappTemplate(e.target.value)}
                rows={6}
                className="w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-[24px] focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none leading-relaxed font-medium text-sm"
                placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e gostaria de fazer o pedido..."
              />
              
              {/* Tags Rápidas */}
              <div className="flex flex-wrap gap-2 pt-2">
                {['nome', 'preco', 'sku', 'link', 'tipo'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setConfigWhatsappTemplate(prev => prev + `{${tag}}`)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/10 active:scale-90"
                  >
                    {`{${tag}}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {configTab === "reajustes" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-lg font-bold text-[var(--dash-text-primary)]">Reajustes e Promoções em Massa</h4>
                  <p className="text-xs text-[var(--dash-text-muted)] max-w-md mt-1 leading-relaxed">
                    Defina descontos (promoções de/por) ou acréscimos (markups) aplicados instantaneamente em categorias ou produtos específicos do catálogo master.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenBulkPromo}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-6 py-4 rounded-lg shadow-lg transition-all"
                >
                  <Percent size={14} />
                  Configurar Reajuste
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] p-4 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Categorias</span>
                  <p className="text-2xl font-black text-purple-500 mt-1">
                    {loadingConfigData ? "..." : configCategoriesCount}
                  </p>
                </div>
                <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] p-4 rounded-lg text-center">
                  <span className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Produtos Ativos</span>
                  <p className="text-2xl font-black text-emerald-500 mt-1">
                    {loadingConfigData ? "..." : configProductsCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-8 border-t flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] transition-colors"
            disabled={savingConfig}
          >
            Fechar
          </button>
          
          <button
            onClick={handleSave}
            disabled={savingConfig}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-lg shadow-lg transition-all"
          >
            {savingConfig ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={14} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
