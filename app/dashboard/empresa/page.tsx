"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BusinessHours, DaySchedule, TimeShift } from "@/lib/utils/time";
import { Copy } from "lucide-react";

const defaultBusinessHours: BusinessHours = {
  timezone: "America/Sao_Paulo",
  manual_override: null,
  schedule: {
    monday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    tuesday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    wednesday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    thursday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    friday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    saturday: { isOpen: true, shifts: [{ open: "08:00", close: "12:00" }] },
    sunday: { isOpen: false, shifts: [] },
  },
};

const dayNames = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function EmpresaPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours);
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
        
        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        const isSuperAdmin = profile.role === "main_admin";
        const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile.organization_id;

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
      if (prev.schedule[day].shifts.length >= 2) return prev; // Limit to 2 shifts for UI simplicity
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
          customDates: [...(current.customDates || []), newCustomDate].sort()
        }
      };
    });
    setNewCustomDate("");
  }

  function handleRemoveCustomHoliday(dateToRemove: string) {
    setBusinessHours(prev => {
      const current = prev.holiday_settings || { autoCloseOnNationalHolidays: false, customDates: [] };
      return {
        ...prev,
        holiday_settings: {
          ...current,
          customDates: current.customDates.filter(d => d !== dateToRemove)
        }
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
    return <p style={{ color: "var(--dash-text-secondary)" }}>Carregando dados da empresa...</p>;
  }

  const isB2CAdmin = role === "b2c_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--dash-text-primary)" }}>
          Empresa
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
          Configure as informações básicas e operacionais da sua empresa.
        </p>
      </div>



      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
              Horários de Atendimento
            </h2>
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Defina os dias e os turnos em que a loja está aberta.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium mr-2" style={{ color: "var(--dash-text-primary)" }}>Modo de Emergência:</label>
            <select
              value={businessHours.manual_override || "null"}
              onChange={(e) => setBusinessHours({ ...businessHours, manual_override: e.target.value === "null" ? null : e.target.value as any })}
              className="dash-select rounded-lg border pl-3 py-1.5 text-sm outline-none cursor-pointer transition-all focus:border-emerald-500"
              style={{
                background: "var(--dash-input-bg)",
                borderColor: "var(--dash-input-border)",
                color: "var(--dash-text-primary)",
              }}
            >
              <option value="null">Seguir Horários Abaixo</option>
              <option value="open">Forçar Aberto Sempre</option>
              <option value="closed">Forçar Fechado (Férias)</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {(Object.keys(dayNames) as Array<keyof typeof dayNames>).map((day) => {
            const dayData = businessHours.schedule[day];
            return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--dash-border)" }}>
                <div className="w-auto min-w-[12rem] shrink-0 pt-1 flex flex-wrap items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dayData.isOpen}
                    onChange={() => handleDayToggle(day)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium" style={{ color: dayData.isOpen ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>
                    {dayNames[day]}
                  </span>
                  
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

                <div className="flex-1 space-y-3">
                  {dayData.isOpen ? (
                    dayData.shifts.map((shift, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="time"
                          value={shift.open}
                          onChange={(e) => handleShiftChange(day, index, "open", e.target.value)}
                          className="rounded-lg border px-3 py-1.5 text-sm outline-none w-28"
                          style={{
                            background: "var(--dash-input-bg)",
                            borderColor: "var(--dash-input-border)",
                            color: "var(--dash-text-primary)",
                          }}
                        />
                        <span className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>até</span>
                        <input
                          type="time"
                          value={shift.close}
                          onChange={(e) => handleShiftChange(day, index, "close", e.target.value)}
                          className="rounded-lg border px-3 py-1.5 text-sm outline-none w-28"
                          style={{
                            background: "var(--dash-input-bg)",
                            borderColor: "var(--dash-input-border)",
                            color: "var(--dash-text-primary)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveShift(day, index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Remover turno"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm" style={{ color: "var(--dash-text-muted)" }}>Fechado</span>
                  )}
                  
                  {dayData.isOpen && dayData.shifts.length < 2 && (
                    <button
                      type="button"
                      onClick={() => handleAddShift(day)}
                      className="text-xs font-medium px-2 py-1 rounded border transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                      style={{ color: "var(--dash-text-secondary)", borderColor: "var(--dash-border)" }}
                    >
                      + Adicionar turno (ex: tarde)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[32px] p-8 border shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
              Feriados e Exceções
            </h2>
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Feche a loja automaticamente em feriados nacionais ou datas locais.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
              Fechar em Feriados Nacionais
            </label>
            <button
              type="button"
              onClick={handleToggleAutoCloseHolidays}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                businessHours.holiday_settings?.autoCloseOnNationalHolidays ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  businessHours.holiday_settings?.autoCloseOnNationalHolidays ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t" style={{ borderColor: "var(--dash-border)" }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--dash-text-primary)" }}>
            Adicionar Data Personalizada (Feriado local ou recesso)
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="date"
              value={newCustomDate}
              onChange={(e) => setNewCustomDate(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--dash-input-bg)",
                borderColor: "var(--dash-input-border)",
                color: "var(--dash-text-primary)",
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomHoliday}
              className="rounded-lg px-4 py-2 text-sm font-bold bg-purple-500 text-white transition-colors hover:bg-purple-600"
            >
              Adicionar
            </button>
          </div>

          {businessHours.holiday_settings?.customDates && businessHours.holiday_settings.customDates.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {businessHours.holiday_settings.customDates.map((dateStr) => {
                const [y, m, d] = dateStr.split('-');
                return (
                  <div key={dateStr} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-[var(--dash-hover-bg)]" style={{ borderColor: "var(--dash-border)" }}>
                    <span className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>{`${d}/${m}/${y}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomHoliday(dateStr)}
                      className="text-red-500 hover:text-red-700 ml-1 rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-60"
          style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)" }}
        >
          {saving ? "Salvando..." : "Salvar Horários da Empresa"}
        </button>
        {saveMessage && (
          <span className={`text-sm font-medium ${saveMessage.includes("Erro") ? "text-red-500" : "text-green-500"}`}>
            {saveMessage}
          </span>
        )}
      </div>
    </div>
  );
}
