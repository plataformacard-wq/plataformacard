import { createClient } from "@/lib/supabase/server";
import { getNationalHolidaysFull } from "@/lib/utils/holidays";
import { getAccessStatusName } from "@/lib/utils/permissions";
import DashboardClient from "./DashboardClient";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role, custom_business_hours, granular_permissions")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile && user.email) {
    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role, custom_business_hours, granular_permissions")
      .eq("email", user.email)
      .maybeSingle();
    if (profileByEmail) profile = profileByEmail;
  }

  if (!profile) return <div>Perfil não encontrado</div>;

  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const isSuperAdmin = profile.role === "main_admin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile.organization_id;

  if (isSuperAdmin && shadowOrgId) {
    const { data: simulatedProfile } = await supabase
      .from("profiles")
      .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role")
      .eq("organization_id", shadowOrgId)
      .in("role", ["b2b_admin", "b2c_admin", "admin"])
      .limit(1)
      .maybeSingle();

    if (simulatedProfile) {
      profile = {
        ...profile,
        id: simulatedProfile.id,
        full_name: simulatedProfile.full_name,
        slug: simulatedProfile.slug,
        organization_id: simulatedProfile.organization_id,
        avatar_url: simulatedProfile.avatar_url,
        whatsapp: simulatedProfile.whatsapp,
        bio: simulatedProfile.bio,
      };
    }
  }

  const displayName = user.user_metadata?.full_name || profile.full_name || "";
  const slug = profile.slug ?? null;
  const avatarUrl = profile.avatar_url ?? null;
  const whatsapp = profile.whatsapp ?? null;
  const userRole = profile.role ?? "";
  
  let productCount = 0;
  let sellerCount = 0;
  let sellers: any[] = [];
  let businessModel = "B2C";
  let orgName = null;
  let hasBlingConnection = false;
  let hasSellersWithoutPhoto = false;
  let customAlerts: any[] = [];
  let upcomingHoliday = null;
  let hasValidWhatsapp = false;
  let hasActiveMasterState = false;
  let hasOwnedMasterState = false;
  let showNoWhatsappWarning = false;
  let profileViews = 0;

  if (activeOrgId) {
    const [{ count: pCount }, { data: sData, count: sCount }, { data: org }, { data: orgCatalogs }] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("organization_id", activeOrgId).is("deleted_at", null),
      supabase.from("profiles").select("id, full_name, slug, avatar_url", { count: "exact" }).eq("organization_id", activeOrgId).eq("role", "seller").limit(5),
      supabase.from("organizations").select("name, business_model, whatsapp, business_hours, bling_access_token, low_stock_threshold").eq("id", activeOrgId).maybeSingle(),
      supabase.from("organization_catalogs").select("is_enabled, catalogs(organization_id, catalog_type, deleted_at)").eq("organization_id", activeOrgId)
    ]);

    productCount = pCount ?? 0;
    sellerCount = sCount ?? 0;
    sellers = sData ?? [];
    hasSellersWithoutPhoto = sellers.some((s: any) => !s.avatar_url);

    if (org?.business_model) businessModel = org.business_model;
    if (org?.name) orgName = org.name;
    if (org?.bling_access_token) hasBlingConnection = true;

    // Feriados
    const orgBusinessHours = org?.business_hours as any;
    if (orgBusinessHours?.holiday_settings?.autoCloseOnNationalHolidays) {
      const today = new Date();
      const maxSearchWindow = new Date(today);
      maxSearchWindow.setDate(today.getDate() + 60);
      
      const currentYear = today.getFullYear();
      const holidaysFull = await getNationalHolidaysFull(currentYear);
      
      const customDates = orgBusinessHours.holiday_settings.customDates || [];
      const customHolidaysFull = customDates.map((d: string) => ({ date: d, name: "Feriado Local / Recesso", type: "custom" }));
      
      const allHolidays = [...holidaysFull, ...customHolidaysFull].sort((a, b) => new Date(`${a.date}T12:00:00Z`).getTime() - new Date(`${b.date}T12:00:00Z`).getTime());
      
      const upcoming = allHolidays.find(h => {
        const hDate = new Date(`${h.date}T12:00:00Z`);
        return hDate >= today && hDate <= maxSearchWindow;
      });

      if (upcoming) {
        const hDate = new Date(`${upcoming.date}T12:00:00Z`);
        const diffTime = hDate.getTime() - today.getTime();
        const daysToHoliday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (orgBusinessHours.custom_alerts && orgBusinessHours.custom_alerts.length > 0) {
          const triggeredAlerts = orgBusinessHours.custom_alerts.filter((a: any) => {
            const adv = a.advanceDays ?? 7;
            return daysToHoliday <= adv;
          });

          if (triggeredAlerts.length > 0) {
            const mostUrgentAlert = triggeredAlerts.reduce((prev: any, current: any) => {
              const prevAdv = prev.advanceDays ?? 7;
              const currAdv = current.advanceDays ?? 7;
              return (prevAdv < currAdv) ? prev : current;
            });
            customAlerts = [mostUrgentAlert];
          }
        }

        if (daysToHoliday <= 7) {
          const decisions = profile.custom_business_hours?.holiday_decisions || [];
          const decided = decisions.find((d: any) => d.date === upcoming.date);
          if (!decided) {
            upcomingHoliday = upcoming;
          }
        }
      }
    }

    const hasProfileWhatsapp = !!whatsapp;
    const hasOrgWhatsapp = !!org?.whatsapp;
    const hasPublishedLink = !!slug;
    
    hasValidWhatsapp = hasProfileWhatsapp || hasOrgWhatsapp;
    
    hasActiveMasterState = orgCatalogs?.some((c: any) => {
      const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
      const isOwner = cat?.organization_id === activeOrgId;
      return c.is_enabled && (cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS') && !cat?.deleted_at && !isOwner;
    }) || false;

    hasOwnedMasterState = orgCatalogs?.some((c: any) => {
      const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
      const isOwner = cat?.organization_id === activeOrgId;
      return c.is_enabled && (cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS') && !cat?.deleted_at && isOwner;
    }) || false;

    const currentIsB2B = org?.business_model === 'B2B' || (org?.business_model !== 'CaaS' && userRole === 'b2b_admin');
    const b2bNeedsSellers = currentIsB2B && sellerCount === 0;
    const b2cNeedsWhatsapp = !currentIsB2B && hasPublishedLink && !hasValidWhatsapp;

    if (b2bNeedsSellers || b2cNeedsWhatsapp) {
      showNoWhatsappWarning = true;
    }
  }

  try {
    const { data: analytics } = await supabase.rpc("get_profile_analytics_summary", { p_profile_id: profile.id });
    if (analytics) {
      const row = Array.isArray(analytics) ? analytics[0] : analytics;
      profileViews = Number(row?.profile_views ?? 0);
    }
  } catch (e) {}

  const isCaaS = businessModel === "CaaS";
  const isB2B = businessModel === "B2B" || (!isCaaS && userRole === "b2b_admin");

  const accessStatusName = getAccessStatusName((profile as any)?.granular_permissions ?? null);
  const isAnalyticAccess = accessStatusName === "Acesso Analítico";

  const initialData = {
    profileData: profile,
    nome: displayName,
    slug,
    avatarUrl,
    whatsapp,
    userRole,
    businessModel,
    isB2B,
    isCaaS,
    isAnalyticAccess,
    productCount,
    sellerCount,
    sellers,
    hasSellersWithoutPhoto,
    orgName,
    hasBlingConnection,
    customAlerts,
    upcomingHoliday,
    hasValidWhatsapp,
    hasActiveMasterState,
    hasOwnedMasterState,
    showNoWhatsappWarning,
    profileViews
  };

  return <DashboardClient initialData={initialData} />;
}