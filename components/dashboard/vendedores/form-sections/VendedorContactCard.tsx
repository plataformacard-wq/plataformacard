import React from "react";
import { Phone, Calendar, Info } from "lucide-react";
import { getPublicUrl } from "@/lib/utils/url";

export function VendedorContactCard(props: any) {
  const {
    formWhatsapp,
    setFormWhatsapp,
    formSlug,
    setFormSlug,
    customDomain,
    formAcceptsMessagesWhenClosed,
    setFormAcceptsMessagesWhenClosed,
    formWhatsappTemplate,
    setFormWhatsappTemplate,
    formRedirectLeads,
    setFormRedirectLeads,
    formHidePrices,
    setFormHidePrices,
    formRecessActive,
    setFormRecessActive,
    formRecessDays,
    setFormRecessDays,
    formRecessHours,
    setFormRecessHours,
    isReadOnly = false,
    catalogType = "product",
  } = props;

  // Label dinâmico para a tag {nome} baseado no tipo do catálogo
  const nomeLabel =
    catalogType === "service" ? "{nome do serviço}" :
    catalogType === "hybrid" ? "{nome do item}" :
    "{nome do produto}";

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return digits.slice(0, 11)
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  return (
    <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
        <Phone size={18} className="text-primary" /> Contato e Link
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">WhatsApp <span className="text-red-500">*</span></label>
          <input 
            type="tel" 
            value={formWhatsapp} 
            onChange={e => setFormWhatsapp(formatWhatsApp(e.target.value))}
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-2 rounded-lg border outline-none bg-[var(--dash-bg)]"
            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Link do Cartão (Slug) <span className="text-red-500">*</span></label>
          <input 
            type="text" value={formSlug} onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="ex: nome_do_vendedor"
            disabled={isReadOnly}
            className="w-full px-4 py-2 rounded-lg border outline-none bg-[var(--dash-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
          {formSlug && (
            <p className="mt-2 text-[10px] font-medium text-primary/60 truncate">
              Link: <span className="font-bold">{getPublicUrl(formSlug, customDomain, false, false)}</span>
            </p>
          )}
        </div>
      </div>
      
      {!isReadOnly && (
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between bg-[var(--dash-bg)] p-3 rounded-lg border" style={{ borderColor: "var(--dash-border)" }}>
          <div>
            <p className="text-[13px] font-bold" style={{ color: "var(--dash-text-primary)" }}>Receber mensagens fora do horário?</p>
            <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">Se desligado, bloqueia o botão quando fechado.</p>
          </div>
          <button 
            type="button"
            onClick={() => setFormAcceptsMessagesWhenClosed(!formAcceptsMessagesWhenClosed)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none mt-2 md:mt-0 ${formAcceptsMessagesWhenClosed ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${formAcceptsMessagesWhenClosed ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )}

      <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-2 block">
          Modelo de Mensagem (WhatsApp)
        </label>
        <textarea 
          value={formWhatsappTemplate} 
          onChange={e => setFormWhatsappTemplate(e.target.value)}
          placeholder="Ex: Olá! Vi o item {item_nome} no valor de {item_preco} e tenho interesse."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border outline-none bg-[var(--dash-bg)] text-sm"
          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { label: nomeLabel, value: '{nome}' },
            { label: '{preco}', value: '{preco}' },
            { label: '{sku}', value: '{sku}' },
            { label: '{categoria}', value: '{categoria}' },
          ].map(tag => (
            <button
              key={tag.value}
              type="button"
              onClick={() => setFormWhatsappTemplate((prev: string) => prev + tag.value)}
              className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-[var(--dash-text-muted)] leading-relaxed">
          Personalize a mensagem que o cliente envia ao clicar no WhatsApp. Deixe vazio para usar o padrão.
        </p>
      </div>

      {!isReadOnly && (
        <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
          <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formRedirectLeads ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}>
            <div className="mt-0.5">
              <input 
                type="checkbox" 
                checked={formRedirectLeads} 
                onChange={e => setFormRedirectLeads(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Redirecionar Cliente (Em caso de Pausa)</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--dash-text-muted)]">
                Se ativado, quando este vendedor for marcado como Inativo (pausado), os clientes que acessarem o link dele serão redirecionados para a lista de consultores ativos da loja, evitando a perda do lead.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Exibir Preços (Atacado vs Varejo) */}
      {!isReadOnly && (
        <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
        <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${!formHidePrices ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}>
          <div className="mt-0.5">
            <input 
              type="checkbox" 
              checked={!formHidePrices} 
              onChange={e => setFormHidePrices(!e.target.checked)} 
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Exibir Preços no Catálogo</span>
            </div>
            <p className="text-[10px] leading-relaxed text-[var(--dash-text-muted)]">
              Se ativado, o catálogo deste vendedor exibirá os preços normalmente. Se desativado, o catálogo não exibirá nenhum preço, independentemente da configuração geral. Ideal para vendedores de atacado.
            </p>
          </div>
        </label>
      </div>
      )}

      {/* Automação de Recesso */}
      {!isReadOnly && (
        <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-purple-500" />
          <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Programar Recesso Temporário</span>
        </div>
        
        <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formRecessActive ? 'border-purple-500 bg-purple-500/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}>
          <div className="mt-0.5">
            <input 
              type="checkbox" 
              checked={formRecessActive} 
              onChange={e => {
                const val = e.target.checked;
                setFormRecessActive(val);
                if (val) {
                  setFormRedirectLeads(true);
                }
              }} 
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
            />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Ativar recesso para este vendedor</span>
            <p className="text-[10px] leading-relaxed text-[var(--dash-text-muted)] mt-0.5">
              Ao salvar com o recesso ativo, o vendedor ficará pausado (Indisponível) e o redirecionamento de clientes será ativado automaticamente durante o período.
            </p>
          </div>
        </label>

        {formRecessActive && (
          <div className="mt-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-[var(--dash-border)] space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Dias de Recesso</label>
                <input 
                  type="number" 
                  min="0"
                  max="365"
                  value={formRecessDays} 
                  onChange={e => setFormRecessDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 rounded-lg border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Horas de Recesso</label>
                <input 
                  type="number" 
                  min="0"
                  max="23"
                  value={formRecessHours} 
                  onChange={e => setFormRecessHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-1.5 rounded-lg border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
              </div>
            </div>
            
            <div className="text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-purple-600 dark:text-purple-400 leading-relaxed">
              <p className="font-semibold flex items-center gap-1">
                <Info size={12} />
                {formRecessDays === 0 && formRecessHours === 0 ? (
                  <span>Defina a duração para calcular a data final.</span>
                ) : (
                  <span>
                    Terminará em: <strong className="underline">
                      {new Date(Date.now() + (formRecessDays * 24 * 60 * 60 * 1000) + (formRecessHours * 60 * 60 * 1000)).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </strong>
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
