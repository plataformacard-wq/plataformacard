"use client";

import {
  Save,
  Loader2,
  CheckCircle2,
  BookOpen,
  Layout,
  Zap,
  Package,
  Settings,
  Sparkles,
  Globe,
  MessageCircle,
  HelpCircle,
  ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";

interface Catalog {
  id: string;
  name: string;
  description: string | null;
  organization_id?: string;
  accent_color?: string;
  secondary_color?: string;
  [key: string]: any;
}

interface ConfiguracoesGeralTabProps {
  catalog: Catalog;
  setCatalog: (c: Catalog | ((prev: Catalog) => Catalog)) => void;
  catalogType: "product" | "service" | "hybrid";
  setCatalogType: (t: "product" | "service" | "hybrid") => void;
  whatsappTemplate: string;
  setWhatsappTemplate: (v: string | ((prev: string) => string)) => void;
  hidePrices: boolean;
  setHidePrices: (v: boolean) => void;
  outOfStockAtEnd: boolean;
  setOutOfStockAtEnd: (v: boolean) => void;
  enableShoppingCart: boolean;
  setEnableShoppingCart: (v: boolean) => void;
  cartMinOrderValue: number;
  setCartMinOrderValue: (v: number) => void;
  cartDeliveryOptions: string[];
  setCartDeliveryOptions: (v: string[] | ((prev: string[]) => string[])) => void;
  cartPaymentMethods: string[];
  setCartPaymentMethods: (v: string[] | ((prev: string[]) => string[])) => void;
  isInheritingMaster: boolean;
  canViewBehavior: boolean;
  saving: boolean;
  saved: boolean;
  handleSave: () => void;
}

export default function ConfiguracoesGeralTab({
  catalog,
  setCatalog,
  catalogType,
  setCatalogType,
  whatsappTemplate,
  setWhatsappTemplate,
  hidePrices,
  setHidePrices,
  outOfStockAtEnd,
  setOutOfStockAtEnd,
  enableShoppingCart,
  setEnableShoppingCart,
  cartMinOrderValue,
  setCartMinOrderValue,
  cartDeliveryOptions,
  setCartDeliveryOptions,
  cartPaymentMethods,
  setCartPaymentMethods,
  isInheritingMaster,
  canViewBehavior,
  saving,
  saved,
  handleSave,
}: ConfiguracoesGeralTabProps) {
  return (
    <motion.div
      key="geral"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid gap-8"
    >
      {/* Informações Básicas */}
      <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 md:p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-[var(--dash-border)] pb-8">
          <div className="h-14 w-14 rounded-[27px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <BookOpen size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Informações Básicas</h3>
            <p className="text-sm text-[var(--dash-text-muted)] font-medium">Como seu catálogo aparece para os clientes.</p>
          </div>
        </div>

        <div className="grid gap-10">
          {/* Nome do Catálogo */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
              <BookOpen size={14} className="text-primary" /> Nome do Catálogo
            </label>
            <input
              type="text"
              value={catalog.name || ""}
              disabled={isInheritingMaster}
              onChange={(e) => setCatalog({ ...catalog, name: e.target.value })}
              className={`w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm ${isInheritingMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Ex: Minha Loja Virtual"
            />
            <p className="text-[11px] text-[var(--dash-text-muted)] font-medium pl-2">
              Este é o nome público que aparecerá no topo do seu catálogo.
            </p>
          </div>

          {/* Tipo de Catálogo */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
              <Zap size={14} className="text-primary" /> Tipo de Catálogo
            </label>
            <div className={`flex flex-wrap p-1.5 rounded-lg bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] ${isInheritingMaster ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
              <button
                onClick={() => !isInheritingMaster && setCatalogType("product")}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${catalogType === "product" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
              >
                <Package size={18} /> Produto
              </button>
              <button
                onClick={() => !isInheritingMaster && setCatalogType("service")}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${catalogType === "service" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
              >
                <Settings size={18} /> Serviço
              </button>
              <button
                onClick={() => !isInheritingMaster && setCatalogType("hybrid")}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${catalogType === "hybrid" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
              >
                <Sparkles size={18} /> Híbrido
              </button>
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)] font-medium pl-2">
              {catalogType === 'product' && 'Ideal para lojas de varejo e atacado.'}
              {catalogType === 'service' && 'Perfeito para consultores, mecânicos e prestadores de serviço.'}
              {catalogType === 'hybrid' && 'Permite classificar cada item individualmente como produto ou serviço.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[var(--dash-border)]">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                <Globe size={14} className="text-primary" /> Descrição da Vitrine (SEO)
              </label>
              <textarea
                value={catalog.description || ""}
                disabled={isInheritingMaster}
                onChange={(e) => setCatalog({ ...catalog, description: e.target.value })}
                rows={6}
                className={`w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm ${isInheritingMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="Descreva seu negócio para seus clientes e para o Google..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                  <MessageCircle size={14} className="text-primary" /> Modelo de Mensagem (WhatsApp)
                </label>
                <div className="group relative">
                  <HelpCircle size={14} className="text-[var(--dash-text-muted)] cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed">
                    Use as tags para injetar dados reais do produto na mensagem. Ex: &ldquo;Olá, quero saber mais sobre o {`{nome}`}&rdquo;
                  </div>
                </div>
              </div>
              <textarea
                value={whatsappTemplate}
                disabled={isInheritingMaster}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
                rows={6}
                className={`w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm ${isInheritingMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e gostaria de saber mais..."
              />

              {/* Tags Rápidas */}
              <div className={`flex flex-wrap gap-2 pt-2 ${isInheritingMaster ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
                {[
                  {
                    label: catalogType === "service" ? "{nome do serviço}" : catalogType === "hybrid" ? "{nome do item}" : "{nome do produto}",
                    value: "nome"
                  },
                  { label: "{preco}", value: "preco" },
                  { label: "{sku}", value: "sku" },
                  { label: "{categoria}", value: "categoria" },
                ].map(tag => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => !isInheritingMaster && setWhatsappTemplate((prev: string) => prev + `{${tag.value}}`)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/10 active:scale-90"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comportamento da Vitrine */}
          <div className={`pt-8 border-t border-[var(--dash-border)] space-y-6 ${!canViewBehavior ? 'opacity-70 pointer-events-none' : ''}`}>
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
              <Layout size={14} className="text-primary" /> Comportamento da Vitrine {!canViewBehavior && "(Somente Leitura)"}
            </h4>
            <div className="space-y-4">
              {/* Ocultação de Preços */}
              <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg">
                <div className="space-y-1 pr-6">
                  <label className="text-sm font-black text-[var(--dash-text-primary)] tracking-tight">Ocultar Preços (Negociação via WhatsApp)</label>
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] leading-relaxed">
                    Esconde todos os valores financeiros da vitrine. Os clientes verão apenas o botão do WhatsApp. Ideal para vendas complexas ou vitrines B2B/CaaS.
                  </p>
                </div>
                <button
                  onClick={() => setHidePrices(!hidePrices)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${hidePrices ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-[var(--dash-surface)] shadow ring-0 transition duration-300 ease-in-out ${hidePrices ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
              </div>

              {/* Produtos Esgotados no Fim */}
              <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg">
                <div className="space-y-1 pr-6">
                  <label className="text-sm font-black text-[var(--dash-text-primary)] tracking-tight">Produtos Esgotados no Fim</label>
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] leading-relaxed">
                    Move automaticamente todos os produtos marcados como esgotados para o final de suas respectivas categorias na vitrine do catálogo.
                  </p>
                </div>
                <button
                  onClick={() => setOutOfStockAtEnd(!outOfStockAtEnd)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${outOfStockAtEnd ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-[var(--dash-surface)] shadow ring-0 transition duration-300 ease-in-out ${outOfStockAtEnd ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Carrinho de Compras / Comanda WhatsApp */}
          <div className="pt-8 border-t border-[var(--dash-border)] space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
              <ShoppingBag size={14} className="text-primary" /> Modo Carrinho / Comanda WhatsApp
            </h4>
            <div className="space-y-6">
              {/* Toggle Habilitar Carrinho */}
              <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg">
                <div className="space-y-1 pr-6">
                  <label className="text-sm font-black text-[var(--dash-text-primary)] tracking-tight">
                    Habilitar Carrinho de Compras (Multi-produtos)
                  </label>
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] leading-relaxed">
                    Permite que seus clientes adicionem vários produtos e quantidades ao catálogo e enviem o pedido completo formatado via WhatsApp. Ideal para docerias, pequenos comércios e lanchonetes.
                  </p>
                </div>
                <button
                  onClick={() => setEnableShoppingCart(!enableShoppingCart)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${enableShoppingCart ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-[var(--dash-surface)] shadow ring-0 transition duration-300 ease-in-out ${enableShoppingCart ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
              </div>

              {enableShoppingCart && (
                <div className="p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl space-y-6 animate-fadeIn">
                  {/* Valor Mínimo */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-[var(--dash-text-muted)]">
                      Valor Mínimo do Pedido (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={cartMinOrderValue || 0}
                      onChange={(e) => setCartMinOrderValue(parseFloat(e.target.value) || 0)}
                      className="w-full max-w-xs p-3 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl text-sm font-bold text-[var(--dash-text-primary)] focus:ring-2 focus:ring-primary outline-none"
                      placeholder="0.00"
                    />
                    <p className="text-[11px] text-[var(--dash-text-muted)]">
                      Defina 0 para aceitar pedidos de qualquer valor.
                    </p>
                  </div>

                  {/* Formas de Entrega */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-[var(--dash-text-muted)]">
                      Tipos de Entrega Aceitos:
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { id: "retirada", label: "Retirada no Local" },
                        { id: "entrega", label: "Entrega em Casa" },
                      ].map((opt) => {
                        const checked = cartDeliveryOptions.includes(opt.id);
                        return (
                          <label
                            key={opt.id}
                            className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--dash-text-primary)]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCartDeliveryOptions((prev) => [...prev, opt.id]);
                                } else {
                                  setCartDeliveryOptions((prev) => prev.filter((i) => i !== opt.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-primary border-[var(--dash-border)] focus:ring-primary"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Formas de Pagamento */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-[var(--dash-text-muted)]">
                      Formas de Pagamento Aceitas:
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { id: "pix", label: "Pix" },
                        { id: "cartao", label: "Cartão de Crédito/Débito" },
                        { id: "dinheiro", label: "Dinheiro" },
                      ].map((pay) => {
                        const checked = cartPaymentMethods.includes(pay.id);
                        return (
                          <label
                            key={pay.id}
                            className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--dash-text-primary)]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCartPaymentMethods((prev) => [...prev, pay.id]);
                                } else {
                                  setCartPaymentMethods((prev) => prev.filter((i) => i !== pay.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-primary border-[var(--dash-border)] focus:ring-primary"
                            />
                            <span>{pay.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              flex items-center gap-3 px-12 py-4 rounded-[27px] font-black text-lg transition-all shadow-xl
              ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'}
              disabled:opacity-50
            `}
          >
            {saving ? (
              <Loader2 size={24} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={24} />
            ) : (
              <Save size={24} />
            )}
            {saved ? 'Salvo com Sucesso!' : saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </section>
    </motion.div>
  );
}
