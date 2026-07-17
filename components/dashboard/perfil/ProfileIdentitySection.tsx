"use client";
import React from "react";
import { Copy, ShieldCheck, Info, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessHours, TimeShift, DAY_NAMES_PT } from "@/lib/utils/time";

import { VendedorHeaderControls } from "../vendedores/form-sections/VendedorHeaderControls";
import { VendedorIdentityCard } from "../vendedores/form-sections/VendedorIdentityCard";
import { VendedorContactCard } from "../vendedores/form-sections/VendedorContactCard";

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
    granularPermissions,
    role,
    isReadOnly = false,
  } = props;

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
      {view === "card" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-6"
        >
          {/* Header */}
          <VendedorHeaderControls 
            selectedSeller={true}
            hideBackButton={true}
            customTitle="Meu Cartão Público"
            customSubtitle="Gerencie a disponibilidade e acesse o seu cartão virtual diretamente."
            formAvailable={isAvailable}
            setFormAvailable={setIsAvailable}
            formName={nameInput}
            formSlug={slugInput}
            customDomain={customDomain}
            isReadOnly={isReadOnly}
          />

          {/* Ficha Principal (Idêntica ao Gestor) */}
          <div className="space-y-6">
            <VendedorIdentityCard 
              formAvatar={avatarPreview}
              setFormAvatar={setAvatar}
              setFormAvatarFile={setAvatarFile}
              setActiveUploadType={setActiveUploadType}
              setShowImageEditor={setShowImageEditor}
              formPublicBanner={publicBannerPreview}
              setFormPublicBanner={setPublicBanner}
              setFormPublicBannerFile={setPublicBannerFile}
              formName={nameInput}
              setFormName={setNameInput}
              formJobTitle={jobTitleInput}
              setFormJobTitle={setJobTitleInput}
              formBio={bioInput}
              setFormBio={setBioInput}
              formRole={role || "seller"}
              readOnlyRole={true}
              isReadOnly={isReadOnly}
            />

            <VendedorContactCard 
              formWhatsapp={whatsappInput}
              setFormWhatsapp={setWhatsappInput}
              formSlug={slugInput}
              setFormSlug={(val: string) => handleSlugChange({target: {value: val}})}
              customDomain={customDomain}
              formAcceptsMessagesWhenClosed={acceptsMessagesWhenClosed}
              setFormAcceptsMessagesWhenClosed={setAcceptsMessagesWhenClosed}
              formWhatsappTemplate={whatsappTemplateInput}
              setFormWhatsappTemplate={setWhatsappTemplateInput}
              formRedirectLeads={redirectLeads}
              setFormRedirectLeads={setRedirectLeads}
              formRecessActive={recessActive}
              setFormRecessActive={(val: boolean) => {
                setRecessActive(val);
                if (val && recessDays === 0 && recessHours === 0) setRecessDays(7);
              }}
              formRecessDays={recessDays}
              setFormRecessDays={setRecessDays}
              formRecessHours={recessHours}
              setFormRecessHours={setRecessHours}
              formHidePrices={false}
              setFormHidePrices={() => {}}
              isReadOnly={isReadOnly}
            />
          </div>

          {/* Card 3: Permissões e Horários (Específico ou Colapsável) */}
          {!isReadOnly && canEditRecess && (
            <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
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
                        <div className="mb-4 text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2">
                          <Info size={14} /> Você está utilizando o horário padrão da sua empresa.
                        </div>
                      )}

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
          )}

          {/* Spacer to prevent content from being hidden behind fixed button */}
          <div className="h-20 w-full" />

          {/* Action */}
          <div className="fixed bottom-6 right-4 md:right-8 z-40">
            <button 
              onClick={handleSave} 
              disabled={saving || !nameInput.trim()}
              className={`px-8 py-3 rounded-lg font-bold transition-all shadow-xl active:scale-95 ${
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
    </>
  );
}
