"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BusinessHours, 
  DEFAULT_BUSINESS_HOURS, 
  DAY_NAMES_PT, 
  TimeShift 
} from "@/lib/utils/time";
import { Copy, Plus, Trash2, Calendar, Bell, Clock, Shield } from "lucide-react";
import { StoreQuickStatusCard } from "@/components/dashboard/empresa/StoreQuickStatusCard";

export default function EmpresaPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [newCustomDate, setNewCustomDate] = useState("");
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C" | "CaaS">("B2B");
  const [centralizeLeads, setCentralizeLeads] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setRole(profile.role);
        
        const shadowOrgId = typeof document !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("shadow_org_id="))
              ?.split("=")[1]
          : undefined;

        const isSuperAdmin = profile.role === "main_admin";
        let activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile.organization_id;

        if (!activeOrgId) {
          const { data: firstOrg } = await supabase
            .from("organizations")
            .select("id")
            .limit(1)
            .maybeSingle();
          if (firstOrg) activeOrgId = firstOrg.id;
        }

        if (activeOrgId) {
          setOrgId(activeOrgId);
          const { data: org } = await supabase
            .from("organizations")
            .select("business_hours, business_model, centralize_leads")
            .eq("id", activeOrgId)
            .maybeSingle();
          
          if (org) {
            if (org.business_hours) setBusinessHours(org.business_hours as unknown as BusinessHours);
            if (org.business_model) setBusinessModel(org.business_model as "B2B" | "B2C" | "CaaS");
            if (org.centralize_leads !== undefined) setCentralizeLeads(!!org.centralize_leads);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  // Atualização rápida de status (Aberto / Fechado / Grade Automática) em tempo real
  const handleUpdateOverride = async (newOverride: "open" | "closed" | null) => {
    const updated: BusinessHours = {
      ...businessHours,
      manual_override: newOverride,
    };
    setBusinessHours(updated);
    
    let targetOrgId = orgId;
    if (!targetOrgId) {
      const { data: org } = await supabase.from("organizations").select("id").limit(1).maybeSingle();
      if (org) targetOrgId = org.id;
    }

    if (targetOrgId) {
      const { error } = await supabase
        .from("organizations")
        .update({ business_hours: updated as any })
        .eq("id", targetOrgId);
      if (error) {
        console.error("Erro ao salvar override na organização:", error);
        throw error;
      }
    }
  };

  function handleDayToggle(day: keyof BusinessHours["schedule"]) {
    setBusinessHours(prev => ({
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
    setBusinessHours(prev => {
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

  function handleAddShift(day: keyof BusinessHours["schedule"]) {
    setBusinessHours(prev => {
      if (prev.schedule[day].shifts.length >= 2) return prev;
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            shifts: [...prev.schedule[day].shifts, { open: "13:00", close: "18:00" }]
          }
        }
      };
    });
  }

  function handleRemoveShift(day: keyof BusinessHours["schedule"], shiftIndex: number) {
    setBusinessHours(prev => {
      const newShifts = prev.schedule[day].shifts.filter((_, i) => i !== shiftIndex);
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            shifts: newShifts,
            isOpen: newShifts.length > 0
          }
        }
      };
    });
  }

  function handleCopyMondayToWeek() {
    setBusinessHours(prev => {
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

  function handleToggleAutoCloseHolidays() {
    setBusinessHours(prev => {
      const current = prev.holiday_settings || { autoCloseOnNationalHolidays: false, customDates: [] };
      return {
        ...prev,
        holiday_settings: {
          ...current,
          autoCloseOnNationalHolidays: !current.autoCloseOnNationalHolidays
        }
      };
    });
  }

  function handleAddCustomHoliday() {
    if (!newCustomDate) return;
    setBusinessHours(prev => {
      const current = prev.holiday_settings || { autoCloseOnNationalHolidays: false, customDates: [] };
      if (current.customDates.includes(newCustomDate)) return prev;
      return {
        ...prev,
        holiday_settings: {
          ...current,
          customDates: [...current.customDates, newCustomDate]
        }
      };
    });
    setNewCustomDate("");
  }

  function handleRemoveCustomHoliday(dateStr: string) {
    setBusinessHours(prev => {
      const current = prev.holiday_settings || { autoCloseOnNationalHolidays: false, customDates: [] };
      return {
        ...prev,
        holiday_settings: {
          ...current,
          customDates: current.customDates.filter(d => d !== dateStr)
        }
      };
    });
  }

  function handleAddAlert() {
    setBusinessHours(prev => {
      const currentAlerts = prev.custom_alerts || [];
      if (currentAlerts.length >= 3) return prev;
      return {
        ...prev,
        custom_alerts: [
          ...currentAlerts,
          { id: crypto.randomUUID(), message: "", color: "blue", advanceDays: 7 }
        ]
      };
    });
  }

  function handleUpdateAlert(id: string, field: "message" | "color" | "advanceDays", value: string | number) {
    setBusinessHours(prev => {
      const currentAlerts = prev.custom_alerts || [];
      return {
        ...prev,
        custom_alerts: currentAlerts.map(a => a.id === id ? { ...a, [field]: value } : a)
      };
    });
  }

  function handleRemoveAlert(id: string) {
    setBusinessHours(prev => {
      const currentAlerts = prev.custom_alerts || [];
      return {
        ...prev,
        custom_alerts: currentAlerts.filter(a => a.id !== id)
      };
    });
  }

  async function handleSave() {
    if (!orgId) return;
    setSaving(true);
    setSaveMessage("");

    const { error } = await supabase
      .from("organizations")
      .update({ 
        business_hours: businessHours as any,
        business_model: businessModel,
        centralize_leads: centralizeLeads
      })
      .eq("id", orgId);

    if (error) {
      setSaveMessage("Erro ao salvar horários.");
    } else {
      setSaveMessage("Horários salvos com sucesso!");
      setTimeout(() => setSaveMessage(""), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[var(--dash-text-secondary)]">
        Carregando dados operacionais da empresa...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      
      {/* 1. Header da Página */}
      <div className="space-y-1 pb-1">
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)] tracking-tight">
          Horários de Atendimento & Operação
        </h1>
        <p className="text-xs sm:text-sm text-[var(--dash-text-secondary)]">
          Controle o status em tempo real e a grade de funcionamento do seu catálogo.
        </p>
      </div>

      {/* 2. Card de Controle Rápido de Status (Instant Switch 1-Clique) */}
      <StoreQuickStatusCard
        businessHours={businessHours}
        organizationId={orgId}
        onUpdateOverride={handleUpdateOverride}
      />

      {/* 3. Card da Grade Semanal de Horários */}
      <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-cyan-500" />
            <div>
              <h2 className="text-base font-bold text-[var(--dash-text-primary)]">
                Grade Semanal de Atendimento
              </h2>
              <p className="text-xs text-[var(--dash-text-secondary)]">
                Utilizada quando o status estiver no modo "Grade Automática".
              </p>
            </div>
          </div>
        </div>

        {/* Linhas de Cada Dia da Semana */}
        <div className="space-y-4">
          {(Object.keys(DAY_NAMES_PT) as Array<keyof typeof DAY_NAMES_PT>).map((day) => {
            const dayData = businessHours.schedule[day];
            return (
              <div 
                key={day} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-[var(--dash-surface-secondary)] transition-all"
              >
                <div className="w-40 shrink-0 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    checked={dayData.isOpen}
                    onChange={() => handleDayToggle(day)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label 
                    htmlFor={`day-${day}`}
                    className={`text-xs font-semibold cursor-pointer ${
                      dayData.isOpen ? "text-[var(--dash-text-primary)]" : "text-[var(--dash-text-muted)]"
                    }`}
                  >
                    {DAY_NAMES_PT[day]}
                  </label>
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-3">
                  {dayData.isOpen ? (
                    dayData.shifts.map((shift, index) => (
                      <div key={index} className="flex items-center gap-2 flex-wrap">
                        <input
                          type="time"
                          value={shift.open}
                          onChange={(e) => handleShiftChange(day, index, "open", e.target.value)}
                          className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] text-[var(--dash-text-primary)] px-2.5 py-1 text-xs outline-none w-24 font-mono focus:border-emerald-500/50"
                        />
                        <span className="text-xs text-[var(--dash-text-muted)]">até</span>
                        <input
                          type="time"
                          value={shift.close}
                          onChange={(e) => handleShiftChange(day, index, "close", e.target.value)}
                          className="rounded-lg border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] text-[var(--dash-text-primary)] px-2.5 py-1 text-xs outline-none w-24 font-mono focus:border-emerald-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveShift(day, index)}
                          className="p-1 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          title="Remover turno"
                        >
                          ✕
                        </button>
                        
                        {day === 'monday' && index === 0 && (
                          <button
                            type="button"
                            onClick={handleCopyMondayToWeek}
                            className="ml-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                            title="Copiar horário de Segunda para Terça a Sexta"
                          >
                            <Copy size={11} /> 
                            <span>Copiar p/ semana</span>
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--dash-text-muted)]">Fechado</span>
                      {day === 'monday' && (
                        <button
                          type="button"
                          onClick={handleCopyMondayToWeek}
                          className="ml-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-cyan-500/20"
                        >
                          <Copy size={11} /> 
                          <span>Copiar p/ semana</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  {dayData.isOpen && dayData.shifts.length < 2 && (
                    <button
                      type="button"
                      onClick={() => handleAddShift(day)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/10 text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:border-emerald-500/30 transition-colors cursor-pointer"
                    >
                      + Turno
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Card de Feriados e Exceções */}
      <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-[var(--dash-text-primary)]">
                Feriados e Recessos
              </h2>
              <p className="text-xs text-[var(--dash-text-secondary)]">
                Feche a loja automaticamente em feriados nacionais ou datas pontuais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-[var(--dash-text-primary)] cursor-pointer" htmlFor="toggle-holidays">
              Fechar em Feriados Nacionais
            </label>
            <button
              id="toggle-holidays"
              type="button"
              onClick={handleToggleAutoCloseHolidays}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                businessHours.holiday_settings?.autoCloseOnNationalHolidays ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${
                  businessHours.holiday_settings?.autoCloseOnNationalHolidays ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {businessHours.holiday_settings?.autoCloseOnNationalHolidays && (
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-bold text-[var(--dash-text-primary)]">
              Adicionar Data Local / Feriado Municipal:
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newCustomDate}
                onChange={(e) => setNewCustomDate(e.target.value)}
                className="rounded-xl border border-slate-200/80 dark:border-white/10 px-3 py-2 text-xs bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] outline-none focus:border-purple-500/50 font-mono"
              />
              <button
                type="button"
                onClick={handleAddCustomHoliday}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-purple-500 text-white transition-colors hover:bg-purple-600 cursor-pointer shadow-sm active:scale-95"
              >
                Adicionar Data
              </button>
            </div>

            {businessHours.holiday_settings?.customDates && businessHours.holiday_settings.customDates.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {businessHours.holiday_settings.customDates.map((dateStr) => {
                  const [y, m, d] = dateStr.split('-');
                  return (
                    <div 
                      key={dateStr} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-xs font-medium text-[var(--dash-text-primary)] font-mono"
                    >
                      <span>{`${d}/${m}/${y}`}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomHoliday(dateStr)}
                        className="text-rose-400 hover:text-rose-500 ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Footer com Botão de Salvar Grade */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-[var(--dash-text-muted)]">
          {saveMessage && (
            <span className={`font-semibold ${saveMessage.includes("Erro") ? "text-rose-500" : "text-emerald-500"}`}>
              {saveMessage}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl px-6 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
        >
          {saving ? "Salvando..." : "Salvar Grade Semanal"}
        </button>
      </div>
    </div>
  );
}
