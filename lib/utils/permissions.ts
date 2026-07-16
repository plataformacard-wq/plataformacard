export function matchesPreset(perms: any, preset: any) {
  if (!perms || !preset) return false;
  for (const module of ['catalog', 'company', 'analytics', 'profile']) {
    for (const key of Object.keys(preset[module] || {})) {
      if ((perms[module]?.[key] ?? false) !== preset[module][key]) {
        return false;
      }
    }
  }
  return true;
}

export function getAccessStatusName(granularPermissions: any): string {
  if (!granularPermissions) return "Acesso Analítico";

  const total = {
    catalog: { create: true, edit: true, delete: true, bulk: true, settings_general: true, settings_behavior: true, settings_banners: true, settings_status: true },
    company: { hours: true, seo: true, domain: true },
    analytics: { general: true, financial: true },
    profile: { basic_info: true, avatar: true, password: true, messages_when_closed: true, redirect_leads: true, recess: true }
  };
  const admin = {
    catalog: { create: true, edit: true, delete: false, bulk: true, settings_general: true, settings_behavior: false, settings_banners: true, settings_status: false },
    company: { hours: true, seo: false, domain: false },
    analytics: { general: true, financial: false },
    profile: { basic_info: true, avatar: true, password: false, messages_when_closed: true, redirect_leads: false, recess: false }
  };
  const analitico = {
    catalog: { create: false, edit: false, delete: false, bulk: false, settings_general: false, settings_behavior: false, settings_banners: false, settings_status: false },
    company: { hours: false, seo: false, domain: false },
    analytics: { general: true, financial: false },
    profile: { basic_info: false, avatar: false, password: false, messages_when_closed: false, redirect_leads: false, recess: false }
  };

  if (matchesPreset(granularPermissions, total)) return "Acesso Total Gestor";
  if (matchesPreset(granularPermissions, admin)) return "Acesso Administrativo";
  if (matchesPreset(granularPermissions, analitico)) return "Acesso Analítico";

  return "Acesso Personalizado";
}

export function getAccessStatusColor(statusName: string): string {
  if (statusName === "Acesso Total Gestor") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (statusName === "Acesso Administrativo") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (statusName === "Acesso Analítico") return "bg-red-500/10 text-red-500 border-red-500/20";
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}
