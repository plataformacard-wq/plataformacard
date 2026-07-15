import React from "react";
import { ShieldCheck, ChevronDown, Package, BarChart3, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const dayNamesMap = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function VendedorAccessCard(props: any) {
  const {
    showHoursConfig,
    setShowHoursConfig,
    formAccessCatalog,
    setFormAccessCatalog,
    formAccessAnalytics,
    setFormAccessAnalytics,
    formAccessCompany,
    setFormAccessCompany,
    formCanCustomize,
    setFormCanCustomize,
    formPassword,
    setFormPassword,
    formHours,
    handleDayToggle,
    handleShiftChange,
  } = props;

  return (
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

              {/* Definição de Senha */}
              <div className="pt-4 space-y-4 border-t" style={{ borderColor: "var(--dash-border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-2">Credenciais de Acesso:</p>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Senha para Login do Vendedor</label>
                  <input 
                    type="text" 
                    value={formPassword || ''} 
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="Digite uma senha (mín. 6 caracteres)"
                    className="w-full sm:w-1/2 px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  <p className="text-[10px] text-[var(--dash-text-muted)] mt-1 leading-relaxed">
                    O vendedor usará o seu próprio <strong>Link (Slug)</strong> e essa senha para fazer login no sistema. Se você não preencher nada, a senha atual (se existir) será mantida.
                  </p>
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
  );
}
