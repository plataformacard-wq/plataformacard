"use client";
import React from "react";
import { Upload, X, Camera, Image as ImageIcon, Calendar, Info, Clock, Users, Phone, ExternalLink, ShieldCheck, ChevronDown, Package, Globe, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicUrl } from "@/lib/utils/url";
import { BusinessHours, TimeShift, DaySchedule, DEFAULT_BUSINESS_HOURS, DAY_NAMES_PT } from "@/lib/utils/time";

export default function ProfileIdentitySection(props: any) {
  const {
    view,
    isAvailable,
    recessActive,
    setIsAvailable,
    userSlug,
    activeProfileUserId,
    customDomain,
    avatarPreview,
    setActiveUploadType,
    setShowImageEditor,
    setAvatar,
    setAvatarFile,
    nameInput,
    setNameInput,
    jobTitleInput,
    setJobTitleInput,
    bioInput,
    setBioInput,
    publicBannerPreview,
    setPublicBanner,
    setPublicBannerFile,
    whatsappInput,
    setWhatsappInput,
    slugInput,
    handleSlugChange,
    slugChecking,
    slugError,
    whatsappTemplateInput,
    setWhatsappTemplateInput,
    redirectLeads,
    setRedirectLeads,
    isAcceptingOrders,
    setIsAcceptingOrders,
    recessDays,
    setRecessDays,
    recessHours,
    setRecessHours,
    setRecessActive,
    showHoursConfig,
    setShowHoursConfig,
    canCustomize,
    useCompanyHours,
    setUseCompanyHours,
    customBusinessHours,
    publicBanner,
    publicBannerFile,
    acceptsMessagesWhenClosed,
    setAcceptsMessagesWhenClosed,
    setCustomBusinessHours,

    handleHoursChange,
    businessModel,
    saving,
    handleSave,
    slugOriginal,
    granularPermissions
  } = props;

  const canEditBasicInfo = granularPermissions?.profile?.basic_info ?? true;
  const canEditAvatar = granularPermissions?.profile?.avatar ?? true;
  const canEditMessagesWhenClosed = granularPermissions?.profile?.messages_when_closed ?? true;
  const canEditRedirectLeads = granularPermissions?.profile?.redirect_leads ?? true;
  const canEditRecess = granularPermissions?.profile?.recess ?? true;


  function handleDayToggle(day: keyof BusinessHours["schedule"]) {
    setCustomBusinessHours((prev: BusinessHours) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          isOpen: !prev.schedule[day].isOpen,
          shifts: !prev.schedule[day].isOpen && prev.schedule[day].shifts.length === 0 
            ? [{ open: "08:00", close: "18:00" }] 
            : prev.schedule[day].shifts
        }
      }
    }));
  }

  function handleShiftChange(day: keyof BusinessHours["schedule"], shiftIndex: number, field: keyof TimeShift, value: string) {
    setCustomBusinessHours((prev: BusinessHours) => {
      const newShifts = [...prev.schedule[day].shifts];
      newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            shifts: newShifts
          }
        }
      };
    });
  }

  function handleCopyMondayToWeek() {
    setCustomBusinessHours((prev: BusinessHours) => {
      const mondayData = prev.schedule.monday;
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          tuesday: JSON.parse(JSON.stringify(mondayData)),
          wednesday: JSON.parse(JSON.stringify(mondayData)),
          thursday: JSON.parse(JSON.stringify(mondayData)),
          friday: JSON.parse(JSON.stringify(mondayData)),
        }
      };
    });
  }

  return (
    <>
          {/* Card 1 — Identidade */}
          {view === "card" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              {/* Header com Toggle */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[27px] border shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                    Editar Cartão Público
                  </h2>
                  <p className="text-xs text-[var(--dash-text-muted)] mt-1">
                    Gerencie a disponibilidade e acesse o seu cartão virtual diretamente.
                  </p>
                </div>

                {/* Controles de Acesso Rápido */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Switch de Disponibilidade */}
                  <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/20 px-4 py-2 rounded-[27px] border border-[var(--dash-border)]">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isAvailable && !recessActive ? 'text-emerald-500 font-extrabold' : 'text-slate-400'}`}>
                      {isAvailable && !recessActive ? 'Disponível' : 'Indisponível'}
                    </span>
                    <button 
                      type="button"
                      disabled={recessActive}
                      onClick={() => !recessActive && setIsAvailable(!isAvailable)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAvailable && !recessActive ? 'bg-emerald-500' : 'bg-slate-300'} ${recessActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${isAvailable && !recessActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Link de Cartão Público */}
                  {slugInput && (
                    <a 
                      href={getPublicUrl(slugInput, customDomain, true, true)} 
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-[27px] bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20 shadow-sm"
                    >
                      <ExternalLink size={14} /> Cartão Virtual
                    </a>
                  )}
                </div>
              </div>

              {/* Card 1: Identidade */}
              <div className="rounded-[27px] border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Users size={18} className="text-primary" /> Identidade do Vendedor
                </h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className={`group relative h-28 w-28 rounded-[27px] border overflow-hidden bg-zinc-50 transition-all ${canEditAvatar ? 'hover:border-primary/50 cursor-pointer' : 'opacity-80'}`} 
                      style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                      onClick={() => { if (canEditAvatar) { setActiveUploadType("avatar"); setShowImageEditor(true); } }}
                    >
                      {avatarPreview ? (
                        <>
                          <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                          {canEditAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="text-white" size={24} />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 gap-1">
                          <Upload size={32} />
                        </div>
                      )}
                    </div>
                    
                    {canEditAvatar && (
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => setShowImageEditor(true)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          {avatarPreview ? "Alterar Foto" : "Enviar Foto"}
                        </button>
                        
                        {avatarPreview && (
                          <button 
                            type="button"
                            onClick={() => {
                              setAvatar(null);
                              setAvatarFile(null);
                            }}
                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                          >
                            <X size={12} /> Remover
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block flex items-center gap-2">
                          Nome do Vendedor {!canEditBasicInfo && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}
                        </label>
                        <input 
                          type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                          disabled={!canEditBasicInfo}
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)] disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 flex justify-between items-center">
                          <span className="flex items-center gap-2">Bio / Cargo {!canEditBasicInfo && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}</span>
                          <span className={`text-[10px] ${bioInput.length >= 70 ? 'text-amber-500 font-bold' : 'text-[var(--dash-text-muted)]'}`}>
                            {bioInput.length}/80
                          </span>
                        </label>
                        <textarea 
                          value={bioInput} onChange={e => setBioInput(e.target.value.slice(0, 80))}
                          disabled={!canEditBasicInfo}
                          placeholder="um pequeno texto sobre o vendedor"
                          maxLength={80}
                          rows={2}
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)] resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
              {/* Card 1.5: Banner Público */}
              <div className="rounded-[27px] border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <ImageIcon size={18} className="text-primary" /> Banner do Perfil Público
                </h3>
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="w-full h-32 md:h-48 rounded-[27px] border-2 border-dashed overflow-hidden relative group cursor-pointer transition-all hover:border-primary/50"
                    style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                    onClick={() => { setActiveUploadType("public_banner"); setShowImageEditor(true); }}
                  >
                    {publicBannerFile ? (
                      <img src={URL.createObjectURL(publicBannerFile)} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : publicBanner ? (
                      <img src={publicBanner} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--dash-text-muted)] gap-2">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold uppercase tracking-wider">Adicionar Banner (Opcional)</span>
                        <span className="text-[10px] text-center max-w-[200px]">Recomendado: 1200x400 px</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="text-white" size={32} />
                    </div>
                  </div>
                  {publicBanner && (
                    <button 
                      type="button"
                      onClick={() => {
                        setPublicBanner(null);
                        setPublicBannerFile(null);
                      }}
                      className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                    >
                      <X size={12} /> Remover Banner
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Contato e Link */}
              <div className="rounded-[27px] border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Phone size={18} className="text-primary" /> Contato e Link
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block flex items-center gap-2">
                      WhatsApp {!canEditBasicInfo && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}
                    </label>
                    <input 
                      type="tel" 
                      value={whatsappInput} 
                      onChange={e => setWhatsappInput(e.target.value.replace(/\D/g, ""))}
                      disabled={!canEditBasicInfo}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)] disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                    
                    <div className="mt-4 flex items-center justify-between bg-[var(--dash-bg)] p-3 rounded-xl border" style={{ borderColor: "var(--dash-border)" }}>
                      <div>
                        <p className="text-[13px] font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                          Receber mensagens fora do horário? {!canEditMessagesWhenClosed && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}
                        </p>
                        <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">Se desligado, bloqueia o botão quando fechado.</p>
                      </div>
                      <button 
                        type="button"
                        disabled={!canEditMessagesWhenClosed}
                        onClick={() => setAcceptsMessagesWhenClosed(!acceptsMessagesWhenClosed)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed ${acceptsMessagesWhenClosed ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${acceptsMessagesWhenClosed ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 flex justify-between">
                      <span className="flex items-center gap-2">Link do Cartão (Slug) {!canEditBasicInfo && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}</span>
                      {slugChecking && <span className="text-[10px] lowercase">verificando...</span>}
                    </label>
                    <input 
                      type="text" value={slugInput} onChange={e => handleSlugChange(e.target.value)}
                      disabled={!canEditBasicInfo}
                      placeholder="ex: nome_do_vendedor"
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)] disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ borderColor: slugError ? "#ef4444" : "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                    {slugError ? (
                      <p className="mt-2 text-[10px] font-bold text-red-500 truncate">{slugError}</p>
                    ) : slugInput ? (
                      <p className="mt-2 text-xs font-medium text-[var(--dash-text-muted)] truncate max-w-[200px] sm:max-w-none">
                        Link: <span className="font-bold">{getPublicUrl(slugInput, customDomain, true, false)}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-2 block flex items-center gap-2">
                    Modelo de Mensagem (WhatsApp) {!canEditBasicInfo && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}
                  </label>
                  <textarea 
                    value={whatsappTemplateInput} 
                    onChange={e => setWhatsappTemplateInput(e.target.value)}
                    disabled={!canEditBasicInfo}
                    placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e tenho interesse."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border outline-none bg-[var(--dash-bg)] text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['{nome}', '{preco}', '{sku}', '{link}', '{tipo}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        disabled={!canEditBasicInfo}
                        onClick={() => setWhatsappTemplateInput((prev: string) => prev + tag)}
                        className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className={`flex items-start gap-3 p-4 rounded-[27px] border transition-all ${redirectLeads ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'} ${canEditRedirectLeads ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                    <div className="mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={redirectLeads} 
                        disabled={!canEditRedirectLeads}
                        onChange={e => setRedirectLeads(e.target.checked)} 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                          Redirecionar Cliente (Em caso de Pausa) {!canEditRedirectLeads && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[var(--dash-text-muted)]">
                        Se ativado, quando este vendedor for marcado como Inativo (pausado), os clientes que acessarem o link dele serão redirecionados para a lista de consultores ativos da loja, evitando a perda do lead.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Automação de Recesso */}
                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-purple-500" />
                    <span className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                      Programar Recesso Temporário {!canEditRecess && <ShieldCheck size={12} className="text-[var(--dash-text-muted)]" />}
                    </span>
                  </div>
                  
                  <label className={`flex items-start gap-3 p-4 rounded-[27px] border transition-all ${recessActive ? 'border-purple-500 bg-purple-500/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'} ${canEditRecess ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}>
                    <div className="mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={recessActive} 
                        disabled={!canEditRecess}
                        onChange={e => {
                          const val = e.target.checked;
                          setRecessActive(val);
                          if (val) {
                            if (canEditRedirectLeads) {
                              setRedirectLeads(true);
                            }
                            if (recessDays === 0 && recessHours === 0) setRecessDays(7);
                          }
                        }} 
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Ativar recesso para este vendedor</span>
                      <p className="text-[10px] leading-relaxed text-[var(--dash-text-muted)] mt-0.5">
                        Ao salvar com o recesso ativo, o vendedor ficará pausado (Indisponível) e o redirecionamento de clientes será ativado automaticamente durante o período.
                      </p>
                    </div>
                  </label>

                  {recessActive && (
                    <div className="mt-4 p-4 rounded-[27px] bg-zinc-50/50 dark:bg-zinc-800/20 border border-[var(--dash-border)] space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Dias de Recesso</label>
                          <input 
                            type="number" 
                            min="0"
                            max="365"
                            disabled={!canEditRecess}
                            value={recessDays} 
                            onChange={e => setRecessDays(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Horas de Recesso</label>
                          <input 
                            type="number" 
                            min="0"
                            max="23"
                            disabled={!canEditRecess}
                            value={recessHours} 
                            onChange={e => setRecessHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-purple-600 dark:text-purple-400 leading-relaxed">
                        <p className="font-semibold flex items-center gap-1">
                          <Info size={12} />
                          {recessDays === 0 && recessHours === 0 ? (
                            <span>Defina a duração para ver a data final do recesso.</span>
                          ) : (
                            <span>
                              Retorno previsto: <strong className="underline">
                                {new Date(Date.now() + (recessDays * 24 * 60 * 60 * 1000) + (recessHours * 60 * 60 * 1000)).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
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
              <div className="rounded-[27px] border shadow-sm overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <button 
                  type="button"
                  onClick={() => setShowHoursConfig(!showHoursConfig)}
                  className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                    <ShieldCheck size={18} className="text-primary" /> Horário de Atendimento
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
                        
                        {!canCustomize && (
                          <div className="mb-4 text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2">
                            <Info size={14} /> Você está utilizando o horário padrão da sua empresa.
                          </div>
                        )}
                        
                        {/* Função na Empresa */}
                        <div className="pt-4">
                          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">
                            Função na Empresa
                          </label>
                          <input
                            type="text"
                            value={jobTitleInput}
                            onChange={(e) => setJobTitleInput(e.target.value)}
                            placeholder="Ex: Consultor de Vendas"
                            className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)] transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>

                        <div className={`pt-4 space-y-4 ${!canCustomize ? "opacity-60 pointer-events-none" : ""}`}>
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Quadro de Horários:</p>
                          {(Object.keys(DAY_NAMES_PT) as Array<keyof typeof DAY_NAMES_PT>).map((day) => {
                            const dayData = customBusinessHours.schedule[day];
                            return (
                              <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--dash-border)" }}>
                                <div className="w-auto min-w-[12rem] shrink-0 flex flex-wrap items-center gap-2">
                                  <input type="checkbox" checked={dayData.isOpen} onChange={() => handleDayToggle(day)} className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                                  <span className="text-sm font-medium" style={{ color: dayData.isOpen ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>{DAY_NAMES_PT[day]}</span>
                                  {day === 'monday' && (
                                    <button
                                      type="button"
                                      onClick={handleCopyMondayToWeek}
                                      className="ml-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                      title="Copiar horário de Segunda para toda a semana (Ter-Sex)"
                                    >
                                      <Copy size={12} /> Copiar para a semana
                                    </button>
                                  )}
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2">
                                  {dayData.isOpen && dayData.shifts.map((shift: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input 
                                        type="time" value={shift.open} onChange={e => handleShiftChange(day, idx, "open", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-input-border)", color: "var(--dash-text-primary)" }}
                                      />
                                      <span className="text-[10px]" style={{ color: "var(--dash-text-muted)" }}>até</span>
                                      <input 
                                        type="time" value={shift.close} onChange={e => handleShiftChange(day, idx, "close", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-input-border)", color: "var(--dash-text-primary)" }}
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

              {/* Action */}
              <div className="flex items-center justify-end border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                <button 
                  onClick={handleSave} 
                  disabled={saving || !nameInput.trim()}
                  className={`px-8 py-3 rounded-[27px] font-bold transition-all shadow-xl active:scale-95 ${
                    saving || !nameInput.trim() 
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none" 
                    : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-emerald-500/20"
                  }`}
                >
                  {saving ? "Salvando..." : "Salvar Cartão Público"}
                </button>
              </div>

            </motion.div>
          )}
          {/* Fim do Bloco de Identidade/Card */}
    </>
  );
}
