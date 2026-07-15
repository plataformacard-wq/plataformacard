"use client";
import React from "react";
import { Upload, X, Camera, Image as ImageIcon, Calendar, Info, Clock, Users, Phone, ExternalLink, ShieldCheck, ChevronDown, Package, Globe, Copy, Trash2, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Settings } from "lucide-react";
import { getPublicUrl } from "@/lib/utils/url";



const dayNamesMap = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function VendedoresForm(props: any) {

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

  const {
    selectedSeller,
    setView,
    isB2C,
    formAvatar,
    formAvatarFile,
    setActiveUploadType,
    setShowImageEditor,
    formPublicBanner,
    formPublicBannerFile,
    formRecessDays,
    formRecessHours,
    setShowTerminateConfirm,
    showTerminateConfirm,
    terminating,
    handleTerminateSeller,
    formName,
    setFormName,
    formEmail,
    setFormEmail,
    formJobTitle,
    setFormJobTitle,
    formWhatsapp,
    setFormWhatsapp,
    formWhatsappTemplate,
    setFormWhatsappTemplate,
    formBio,
    setFormBio,
    formAvailable,
    setFormAvailable,
    formRecessActive,
    setFormRecessActive,
    setFormRecessDays,
    setFormRecessHours,
    formAcceptsMessagesWhenClosed,
    setFormAcceptsMessagesWhenClosed,
    formCanCustomize,
    setFormCanCustomize,
    formRedirectLeads,
    setFormRedirectLeads,
    formHidePrices,
    setFormHidePrices,
    formAccessCatalog,
    setFormAccessCatalog,
    formAccessAnalytics,
    setFormAccessAnalytics,
    formAccessCompany,
    setFormAccessCompany,
    formSlug,
    setFormSlug,
    formPassword,
    setFormPassword,
    saving,
    handleSaveSeller,
    customDomain,
    setFormAvatar,
    setFormAvatarFile,
    setFormPublicBanner,
    setFormPublicBannerFile,
    setShowHoursConfig,
    showHoursConfig,
    formHours,
    message,
    isFormValid,
    handleTerminate,
    handleSave,
    handleDayToggle,
    handleShiftChange,

  } = props;

  return (
    <>
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full space-y-6"
          >
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-sm font-medium text-[var(--dash-text-secondary)] hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} /> Voltar para a lista
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                  {selectedSeller ? `Editando: ${formName}` : "Nova Ficha de Vendedor"}
                </h2>
                {selectedSeller && (
                  <p className="text-xs text-[var(--dash-text-muted)] mt-1">
                    Gerencie a disponibilidade e acesse o cartão virtual do vendedor sem sair desta página.
                  </p>
                )}
              </div>

              {/* Controles de Acesso Rápido */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Switch de Disponibilidade */}
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/20 px-4 py-2 rounded-2xl border border-[var(--dash-border)]">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${formAvailable ? 'text-emerald-500 font-extrabold' : 'text-slate-400'}`}>
                    {formAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setFormAvailable(!formAvailable)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Link de Cartão Público */}
                {selectedSeller && (
                  <a 
                    href={getPublicUrl(formSlug, customDomain, false, true)} 
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20 shadow-sm"
                  >
                    <ExternalLink size={14} /> Cartão Virtual
                  </a>
                )}
              </div>
            </div>

            {/* Ficha Completa (Igual ao Perfil) */}
            <div className="space-y-6">
              {/* Card 1: Identidade */}
              <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Users size={18} className="text-primary" /> Identidade do Vendedor
                </h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="group relative h-28 w-28 rounded-3xl border overflow-hidden bg-zinc-50 transition-all hover:border-primary/50 cursor-pointer" 
                      style={{ borderColor: "var(--dash-border)" }}
                      onClick={() => { setActiveUploadType("avatar"); setShowImageEditor(true); }}
                    >
                      {formAvatar ? (
                        <>
                          <img src={formAvatar} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 gap-1">
                          <Upload size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => { setActiveUploadType("avatar"); setShowImageEditor(true); }}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {formAvatar ? "Alterar Foto" : "Enviar Foto"}
                      </button>
                      
                      {formAvatar && (
                        <button 
                          onClick={() => {
                            setFormAvatar(null);
                            setFormAvatarFile(null);
                          }}
                          className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                        >
                          <X size={12} /> Remover
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banner Upload Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl border" style={{ borderColor: "var(--dash-border)", background: "var(--dash-bg)" }}>
                    <div 
                      className="w-full md:w-48 h-24 rounded-2xl border-2 border-dashed overflow-hidden relative group cursor-pointer transition-all hover:border-primary/50 shrink-0 flex flex-col items-center justify-center gap-1"
                      style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                      onClick={() => { setActiveUploadType("public_banner"); setShowImageEditor(true); }}
                    >
                      {formPublicBanner ? (
                        <>
                          <img src={formPublicBanner} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-[var(--dash-text-muted)] gap-1">
                          <ImageIcon size={24} />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-center px-2">Banner (Opcional)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1 w-full text-center md:text-left">
                      <div>
                        <p className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Banner do Cartão</p>
                        <p className="text-[10px] text-[var(--dash-text-muted)]">Recomendado: 1200x400 px</p>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                        <button 
                          onClick={() => { setActiveUploadType("public_banner"); setShowImageEditor(true); }}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          {formPublicBanner ? "Alterar Banner" : "Enviar Banner"}
                        </button>
                        
                        {formPublicBanner && (
                          <button 
                            onClick={() => {
                              setFormPublicBanner(null);
                              setFormPublicBannerFile(null);
                            }}
                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                          >
                            <X size={12} /> Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nome do Vendedor <span className="text-red-500">*</span></label>
                        <input 
                          type="text" value={formName} onChange={e => setFormName(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Função na Empresa</label>
                        <input 
                          type="text" value={formJobTitle} onChange={e => setFormJobTitle(e.target.value)}
                          placeholder="Ex: Consultor de Vendas"
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 flex justify-between items-center">
                          <span>Bio / Cargo <span className="text-red-500">*</span></span>
                          <span className={`text-[10px] ${formBio.length >= 70 ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>
                            {formBio.length}/80
                          </span>
                        </label>
                        <textarea 
                          value={formBio} onChange={e => setFormBio(e.target.value.slice(0, 80))}
                          placeholder="um pequeno texto sobre o vendedor"
                          maxLength={80}
                          rows={2}
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)] resize-none"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Contato e Link */}
              <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
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
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Link do Cartão (Slug) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" value={formSlug} onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="ex: nome_do_vendedor"
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                    {formSlug && (
                      <p className="mt-2 text-[10px] font-medium text-primary/60 truncate">
                        Link: <span className="font-bold">{getPublicUrl(formSlug, customDomain, false, false)}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between bg-[var(--dash-bg)] p-3 rounded-xl border" style={{ borderColor: "var(--dash-border)" }}>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: "var(--dash-text-primary)" }}>Receber mensagens fora do horário?</p>
                    <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">Se desligado, bloqueia o botão quando fechado.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormAcceptsMessagesWhenClosed(!formAcceptsMessagesWhenClosed)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none mt-2 md:mt-0 ${formAcceptsMessagesWhenClosed ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formAcceptsMessagesWhenClosed ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-2 block">
                    Modelo de Mensagem (WhatsApp)
                  </label>
                  <textarea 
                    value={formWhatsappTemplate} 
                    onChange={e => setFormWhatsappTemplate(e.target.value)}
                    placeholder="Ex: Olá! Vi o item {item_nome} no valor de {item_preco} e tenho interesse."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border outline-none bg-[var(--dash-bg)] text-sm"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['{nome}', '{preco}', '{sku}', '{link}', '{tipo}', '{vendedor}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormWhatsappTemplate((prev: string) => prev + tag)}
                        className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--dash-text-muted)] leading-relaxed">
                    Personalize a mensagem que o cliente envia ao clicar no WhatsApp. Deixe vazio para usar o padrão.
                  </p>
                </div>

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

                {/* Exibir Preços (Atacado vs Varejo) */}
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

                {/* Automação de Recesso */}
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
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
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
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-purple-600 dark:text-purple-400 leading-relaxed">
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
              </div>

              {/* Card 3: Permissões e Horários (Colapsável) */}
              <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <button 
                  onClick={() => setShowHoursConfig(!showHoursConfig)}
                  className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 transition-colors"
                >
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                    <ShieldCheck size={18} className="text-primary" /> Nível de Acesso e Horário
                  </h3>
                  <ChevronDown size={20} className={`text-zinc-400 transition-transform ${showHoursConfig ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showHoursConfig && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 space-y-6 border-t" style={{ borderColor: "var(--dash-border)" }}>
                        {/* Gestão de Permissões (Delegated Access) */}
                        <div className="pt-6 space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-4">Módulos que este vendedor pode acessar:</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label 
                              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formAccessCatalog ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}
                            >
                              <div className="mt-0.5">
                                <input type="checkbox" checked={formAccessCatalog} onChange={e => setFormAccessCatalog(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Package size={14} className={formAccessCatalog ? 'text-primary' : 'text-zinc-400'} />
                                  <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Catálogo</span>
                                </div>
                                <p className="text-[10px] leading-tight text-[var(--dash-text-muted)]">Pode gerenciar produtos, categorias e preços.</p>
                              </div>
                            </label>

                            <label 
                              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formAccessAnalytics ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}
                            >
                              <div className="mt-0.5">
                                <input type="checkbox" checked={formAccessAnalytics} onChange={e => setFormAccessAnalytics(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <BarChart3 size={14} className={formAccessAnalytics ? 'text-primary' : 'text-zinc-400'} />
                                  <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Analytics</span>
                                </div>
                                <p className="text-[10px] leading-tight text-[var(--dash-text-muted)]">Ver métricas de acessos e performance da empresa.</p>
                              </div>
                            </label>

                            <label 
                              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formAccessCompany ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}
                            >
                              <div className="mt-0.5">
                                <input type="checkbox" checked={formAccessCompany} onChange={e => setFormAccessCompany(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Settings size={14} className={formAccessCompany ? 'text-primary' : 'text-zinc-400'} />
                                  <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Empresa</span>
                                </div>
                                <p className="text-[10px] leading-tight text-[var(--dash-text-muted)]">Editar logotipo, cores e dados corporativos.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="pt-4 space-y-4 border-t" style={{ borderColor: "var(--dash-border)" }}>
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Horário de Atendimento:</p>
                          <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" checked={formCanCustomize} onChange={e => setFormCanCustomize(e.target.checked)} id="can_customize" className="h-4 w-4" />
                            <label htmlFor="can_customize" className="text-xs font-medium" style={{ color: "var(--dash-text-secondary)" }}>Permitir que este vendedor personalize seu próprio horário</label>
                          </div>
                          {(Object.keys(dayNamesMap) as Array<keyof typeof dayNamesMap>).map((day) => {
                            const dayData = formHours.schedule[day];
                            return (
                              <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--dash-border)" }}>
                                <div className="w-32 flex items-center gap-2">
                                  <input type="checkbox" checked={dayData.isOpen} onChange={() => handleDayToggle(day)} className="h-4 w-4" />
                                  <span className="text-sm font-medium" style={{ color: dayData.isOpen ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>{dayNamesMap[day]}</span>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2">
                                  {dayData.isOpen && dayData.shifts.map((shift: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input 
                                        type="time" value={shift.open} onChange={e => handleShiftChange(day, idx, "open", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)" }}
                                      />
                                      <span className="text-[10px]">até</span>
                                      <input 
                                        type="time" value={shift.close} onChange={e => handleShiftChange(day, idx, "close", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)" }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                <div className="flex items-center gap-4 relative">
                  {selectedSeller && selectedSeller.status !== 'terminated' && (
                    <>
                      {!showTerminateConfirm ? (
                        <button 
                          onClick={() => setShowTerminateConfirm(true)}
                          className="px-4 py-2 text-sm rounded-xl font-bold transition-all text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 opacity-60 hover:opacity-100"
                        >
                          <Trash2 size={16} /> Desligar Vendedor
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 p-2 rounded-2xl border border-red-200 dark:border-red-900 absolute left-0 bottom-full mb-4 whitespace-nowrap z-20 shadow-2xl origin-bottom-left animate-in fade-in zoom-in duration-200">
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 px-2">
                            Desligar permanentemente? Os dados pessoais serão removidos.
                          </span>
                          <button 
                            onClick={handleTerminate}
                            disabled={terminating}
                            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                          >
                            {terminating ? "Desligando..." : "Confirmar"}
                          </button>
                          <button 
                            onClick={() => setShowTerminateConfirm(false)}
                            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {message && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                      message.toLowerCase().includes("erro") || 
                      message.toLowerCase().includes("negada") || 
                      message.toLowerCase().includes("banco") 
                      ? "bg-red-500/10 border-red-500/20 text-red-500" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    }`}>
                      {message.toLowerCase().includes("erro") || 
                       message.toLowerCase().includes("negada") || 
                       message.toLowerCase().includes("banco") 
                        ? <X size={16} /> 
                        : <CheckCircle2 size={16} />
                      }
                      <span className="text-sm font-bold">{message}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 relative">
                  <button 
                    onClick={handleSave} 
                    disabled={saving || !isFormValid}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
                      saving || !isFormValid 
                      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none" 
                      : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-emerald-500/20"
                    }`}
                  >
                    {saving ? "Salvando..." : "Salvar Ficha do Vendedor"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
    </>
  );
}
