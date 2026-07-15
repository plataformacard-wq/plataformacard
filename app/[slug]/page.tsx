import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import ProfileViewTracker from "@/components/analytics/ProfileViewTracker";
import ProfileWhatsAppButton from "@/components/analytics/ProfileWhatsAppButton";
import { getBusinessStatus, BusinessHours } from "@/lib/utils/time";
import { getNationalHolidays } from "@/lib/utils/holidays";
import CatalogBadge from "@/components/catalog/CatalogBadge";
import PublicThemeToggle from "@/components/PublicThemeToggle";
import PublicShareButton from "@/components/PublicShareButton";
import ForceLightTheme from "@/components/public/ForceLightTheme";
import ConsultantsBridge from "@/components/public/ConsultantsBridge";


type PageProps = {
  params: Promise<{ slug: string }>;
};

// SEO Metadata Generation
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, organization_id")
    .ilike("slug", slug)
    .maybeSingle();

  let orgData = null;
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name, meta_title, meta_description, favicon_url")
      .eq("id", profile.organization_id)
      .maybeSingle();
    orgData = org;
  } else {
    const { data: org } = await supabase
      .from("organizations")
      .select("name, meta_title, meta_description, favicon_url")
      .ilike("slug", slug)
      .maybeSingle();
    orgData = org;
  }

  const title = orgData?.meta_title || (profile ? profile.full_name : (orgData ? orgData.name : "Perfil")) + " | PlataformaShop";
  const description = orgData?.meta_description || (profile?.bio) || "Confira meu perfil e catálogo digital.";
  
  let iconsMetadata = undefined;
  if (orgData?.favicon_url) {
    const iconBase = orgData.favicon_url;
    const icon = `${iconBase}${iconBase.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const iconType = iconBase.toLowerCase().endsWith('.jpg') || iconBase.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : iconBase.toLowerCase().endsWith('.png') ? 'image/png' : 'image/x-icon';
    iconsMetadata = {
      icon: [{ url: icon, sizes: "any", type: iconType }],
      shortcut: [{ url: icon, type: iconType }],
      apple: [{ url: icon, type: iconType }],
    };
  }

  return {
    title,
    description,
    ...(iconsMetadata ? { icons: iconsMetadata } : {}),
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

type ProfileRow = {
  id: string;
  slug: string;
  organization_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  is_available: boolean | null;
  custom_business_hours: any;
  can_customize_hours: boolean | null;
  status: string | null;
  redirect_leads: boolean | null;
  recess_ends_at: string | null;
  is_accepting_orders: boolean | null;
  accepts_messages_when_closed: boolean | null;
};

export const revalidate = 60;

function initialsFromName(name: string | null): string {
  if (!name?.trim()) {
    return "?";
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function resolveCatalogIds(
  supabase: ReturnType<typeof createAdminClient>,
  profile: ProfileRow
): Promise<string[]> {
  const catalogIds: string[] = [];

  // 1. Prioridade: Vínculo Individual do Perfil
  const { data: profileCatalogData } = await supabase
    .from("profile_catalogs")
    .select("organization_catalog_id")
    .eq("profile_id", profile.id)
    .eq("is_selected", true)
    .maybeSingle();

  if (profileCatalogData?.organization_catalog_id) {
    const { data: orgCatalogFromProfile } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("id", profileCatalogData.organization_catalog_id)
      .maybeSingle();

    if (orgCatalogFromProfile?.catalog_id) {
      catalogIds.push(orgCatalogFromProfile.catalog_id);
    }
  }

  // 2. Fallback: Catálogos habilitados da organização
  if (catalogIds.length === 0) {
    const { data: enabledCatalogs } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", profile.organization_id)
      .eq("is_enabled", true);

    if (enabledCatalogs && enabledCatalogs.length > 0) {
      catalogIds.push(...enabledCatalogs.map(c => c.catalog_id));
    }
  }

  // 3. Fallback B2B: qualquer catálogo da organização
  if (catalogIds.length === 0) {
    const { data: anyCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", profile.organization_id)
      .limit(1)
      .maybeSingle();

    if (anyCatalog?.catalog_id) {
      catalogIds.push(anyCatalog.catalog_id);
    }
  }

  return catalogIds;
}

async function getCatalogStats(
  supabase: ReturnType<typeof createAdminClient>,
  profile: ProfileRow
): Promise<{ productCount: number; categoryCount: number; latestUpdate: string | null; catalogId: string | null; categories: any[] }> {
  const catalogIds = await resolveCatalogIds(supabase, profile);
  if (catalogIds.length === 0) {
    return { productCount: 0, categoryCount: 0, latestUpdate: null, catalogId: null, categories: [] };
  }

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id")
    .in("catalog_id", catalogIds);

  
  const { data: categoriesResult, error: catError } = await supabase
    .from("categories")
    .select("id, name, icon_url")
    .in("catalog_id", catalogIds)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  
  const categories = categoriesResult || [];
  if (catError) console.error("CAT ERROR:", catError);

  const categoryIds = categories.map((c) => c.id);
  const categoryCount = categoryIds.length;

  let productCount = 0;
  let latestUpdate: string | null = null;

  const { data: prods1 } = await supabase
    .from("products")
    .select("id, created_at, updated_at, image_url, category_id")
    .in("catalog_id", catalogIds)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const allProdsMap = new Map();
  prods1?.forEach(p => allProdsMap.set(p.id, p));

  if (categoryIds.length > 0) {
    const { data: prods2 } = await supabase
      .from("products")
      .select("id, created_at, updated_at, image_url, category_id")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    prods2?.forEach(p => allProdsMap.set(p.id, p));
  }

  // Preenche imagens de categorias vazias com o primeiro produto da categoria
  categories.forEach(c => {
    if (!c.icon_url) {
      for (const p of allProdsMap.values()) {
        if (p.category_id === c.id && p.image_url) {
          c.icon_url = p.image_url;
          break;
        }
      }
    }
  });

  productCount = allProdsMap.size;
  
  // Find latest update
  let latest: Date | null = null;
  allProdsMap.forEach(p => {
    const dt = new Date(p.updated_at || p.created_at || 0);
    if (!latest || dt > latest) {
      latest = dt;
      latestUpdate = p.updated_at || p.created_at;
    }
  });

  return {
    productCount,
    categoryCount,
    latestUpdate,
    catalogId: catalogIds[0],
    categories,
  };
}

export default async function Page(props: PageProps) {
  const supabase = createAdminClient();

  const { slug } = await props.params;

  if (
    slug === "login" ||
    slug === "entrar" ||
    slug === "cadastro" ||
    slug === "dashboard" ||
    slug === "admin" ||
    slug === "auth" ||
    slug === "onboarding" ||
    slug === "recuperar-senha" ||
    slug === "reset-senha" ||
    slug === "test"
  ) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id, slug, business_model")
      .ilike("slug", slug)
      .maybeSingle();

    if (org) {
      redirect(`/${slug}/catalogo`);
    }

    notFound();
  }

  const safeProfile = profile as ProfileRow;

  const [orgRes, catalogStats, analyticsRes] = await Promise.all([
    supabase
      .from("organizations")
      .select("slug, name, business_hours, accent_color, secondary_color, logo_url, favicon_url, business_model, whatsapp, public_banner_url, social_instagram, social_facebook, social_tiktok, social_youtube")
      .eq("id", safeProfile.organization_id)
      .maybeSingle(),
    getCatalogStats(supabase, safeProfile),
    supabase.rpc("get_profile_analytics_summary", {
      p_profile_id: safeProfile.id,
    }),
  ]);

  // Trava de Segurança (Under Construction) se não atingir configuração mínima (100% da barra)
  const hasContact = !!safeProfile.whatsapp || !!orgRes.data?.whatsapp;
  const isReady = catalogStats.productCount > 0 && hasContact;
  console.log("isReady stats 2:", { productCount: catalogStats.productCount, categoryCount: catalogStats.categoryCount, catalogId: catalogStats.catalogId, hasContact, slug });

  if (!isReady) {
    return (
      <>
        <ForceLightTheme />
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <span className="text-4xl">🚧</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Em Construção
          </h1>
          <p className="mb-6 text-sm text-slate-600">
            {orgRes.data?.name || safeProfile.full_name || "Esta empresa"} está preparando novidades incríveis para você. O catálogo estará disponível muito em breve!
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse delay-75"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse delay-150"></div>
          </div>
        </div>
        </div>
      </>
    );
  }

  // Se a organização for CaaS ou o perfil for caas_admin, desabilita o Cartão Digital e vai direto para a Vitrine
  const isCaaS = orgRes.data?.business_model === 'CaaS' || (safeProfile as any).role === 'caas_admin';
  if (isCaaS) {
    redirect(`/${slug}/catalogo`);
  }

  const orgName = orgRes.data?.name?.trim() ?? null;
  const orgSlug = orgRes.data?.slug ?? safeProfile.organization_id;
  const orgBusinessHours = (orgRes.data?.business_hours as unknown as BusinessHours) ?? null;
  const orgLogo = orgRes.data?.logo_url ?? null;
  const orgFavicon = orgRes.data?.favicon_url ?? null;
  const accentColor = orgRes.data?.accent_color || "#25D366";
  const secondaryColor = orgRes.data?.secondary_color || "#128C7E";
  
  const orgBanner = orgRes.data?.public_banner_url ?? null;
  const profileBanner = (safeProfile as any).public_banner_url ?? null;
  const bannerUrl = profileBanner || orgBanner || null;

  const customBusinessHours = (safeProfile.custom_business_hours as unknown as BusinessHours) ?? null;

  let isHolidayRecessActive = false;
  if (customBusinessHours?.holiday_decisions) {
    const spDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const todayStr = spDate.toISOString().split('T')[0];
    const todayDecision = customBusinessHours.holiday_decisions.find((d: any) => d.date === todayStr);
    if (todayDecision && todayDecision.work === false) {
      isHolidayRecessActive = true;
    }
  }

  const isRecessActive = (safeProfile.recess_ends_at && new Date(safeProfile.recess_ends_at) > new Date()) || isHolidayRecessActive;
  const isTerminated = safeProfile.status === 'terminated';
  const isPaused = safeProfile.status === 'paused' || isRecessActive || safeProfile.is_accepting_orders === false;
  const isRedirecting = !!safeProfile.redirect_leads;

  if (isTerminated || (isPaused && isRedirecting)) {
    return (
      <ConsultantsBridge
        profile={safeProfile}
        orgName={orgName}
        orgLogo={orgLogo}
        orgSlug={orgSlug}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
        reason={isTerminated ? 'terminated' : 'paused'}
      />
    );
  }

  // Decide if we use the profile's manual override or the organization's business hours
  // Fase 2: Herança de Horários
  const hasCustomSchedule = customBusinessHours && 
                            customBusinessHours.schedule && 
                            Object.keys(customBusinessHours.schedule).length > 0;
  
  const activeHours = (safeProfile.can_customize_hours && hasCustomSchedule) 
    ? customBusinessHours 
    : orgBusinessHours;

  const currentYear = new Date().getFullYear();
  const nationalHolidays = await getNationalHolidays(currentYear);

  const businessStatus = getBusinessStatus(activeHours, nationalHolidays);
  
  // Se o perfil estava com is_available = false (manual) ou em recesso, forçamos o fechamento. 
  // Caso contrário, seguimos a regra.
  const isAvailableNow = (safeProfile.is_available === false || isRecessActive || safeProfile.is_accepting_orders === false) ? false : businessStatus.isOpenNow;
  const statusMessage = (isRecessActive || safeProfile.is_accepting_orders === false)
    ? "Indisponível para atendimento imediato" 
    : safeProfile.is_available === false 
      ? "Indisponível" 
      : businessStatus.message;


  const bioLine = [safeProfile.bio?.trim() || null, orgName]
    .filter(Boolean)
    .join(" · ");

  let visitCount = 0;
  if (!analyticsRes.error && analyticsRes.data != null) {
    const row = Array.isArray(analyticsRes.data)
      ? analyticsRes.data[0]
      : analyticsRes.data;
    visitCount = Number(
      (row as { profile_views?: number | string | null })?.profile_views ?? 0
    );
  }

  return (
    <>
      
      <ForceLightTheme />
      <main
        className="public-theme-container"
        style={{
          minHeight: "100vh",
          display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        overflow: "hidden"
      }}
    >
      
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white">
        {orgFavicon ? (
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: `url(${orgFavicon})`, 
              backgroundSize: '120px', 
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center' 
            }} 
          />
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full opacity-20" style={{ background: accentColor }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[100px] rounded-full opacity-10" style={{ background: secondaryColor }} />
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-stagger-1 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-stagger-2 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .animate-stagger-3 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .animate-stagger-4 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .animate-stagger-5 { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

        .btn-catalog {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-catalog:hover {
          background: rgba(255,255,255,0.08) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.15) !important;
        }
        .btn-catalog:active {
          transform: translateY(0);
        }

        .stat-block {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .stat-block:hover {
          background: rgba(255,255,255,0.06) !important;
          transform: scale(1.06);
          box-shadow: 0 0 30px rgba(0,0,0,0.5);
          z-index: 10;
          border-radius: 12px;
        }
        .stat-value {
          transition: color 0.3s ease;
        }
        .stat-block:hover .stat-value {
          color: #25D366 !important;
          text-shadow: 0 0 12px rgba(37,211,102,0.4);
        }
        
        .glow-badge {
          animation: pulseGlow 2s infinite alternate;
        }
        @keyframes pulseGlow {
          from { box-shadow: 0 0 6px ${accentColor}; }
          to { box-shadow: 0 0 12px ${accentColor}, 0 0 2px #fff; }
        }
        
        .public-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .public-card:hover {
          transform: translateY(-5px) scale(1.01);
        }
      `}</style>
      <ProfileViewTracker profileId={safeProfile.id} slug={slug} />

      {/* Card */}
      <div
        className="animate-stagger-1 public-card"
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 32,
          position: "relative",
          marginTop: 46, // Espaço para a foto vazar
        }}
      >
        {/* Banner do Cartão */}
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: 120,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            overflow: 'hidden',
            backgroundColor: 'var(--public-glass-bg)',
            zIndex: 0
          }}
        >
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : orgLogo ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
              <img src={orgLogo} alt={orgName || ""} style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
            </div>
          ) : (
             <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${accentColor}20, ${secondaryColor}20)` }} />
          )}
          {/* Subtle gradient overlay to blend */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(255,255,255,0.05) 100%)' }}></div>
        </div>

        {/* Barra verde grossa de destaque */}
        <div
          style={{
            height: 4,
            width: '100%',
            backgroundColor: accentColor,
          }}
        />

        <div style={{ padding: "0 28px 24px", position: "relative", zIndex: 1 }}>
          
          {/* Container Absoluto para Avatar e Badge alinhados à esquerda */}
          {/* Container Absoluto para Avatar e Badge alinhados à esquerda */}
          <div
            style={{
              position: "absolute",
              top: -46, // Metade de 92px
              left: 28,
              width: 92,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Avatar Container */}
            <div style={{ position: "relative", width: 92, height: 92 }}>
              {/* Anel externo brilhante */}
              <div
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: "50%",
                  background: `conic-gradient(from 0deg, ${accentColor} 0%, ${secondaryColor} 40%, rgba(255,255,255,0.1) 60%, ${accentColor} 100%)`,
                  opacity: 0.75,
                }}
              />
              {/* Avatar */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#1c1c1c",
                  border: "3px solid var(--public-card-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 700,
                  color: "var(--public-text-main)",
                  letterSpacing: "-0.02em",
                }}
              >
                {safeProfile.avatar_url ? (
                  <img
                    src={safeProfile.avatar_url}
                    alt={safeProfile.full_name ?? "Foto do perfil"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : orgFavicon ? (
                  <img
                    src={orgFavicon}
                    alt={orgName ?? "Logo da empresa"}
                    style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "white" }}
                  />
                ) : (
                  initialsFromName(safeProfile.full_name)
                )}
              </div>
            </div>

            {/* Badge ABERTO AGORA */}
            <div
              className="public-status-pill"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "var(--public-status-bg)",
                border: `1px solid ${isAvailableNow ? "rgba(37,211,102,0.25)" : "rgba(156,163,175,0.25)"}`,
                borderRadius: 999,
                padding: "1px 6px", // Reduced padding
                whiteSpace: "nowrap"
              }}
            >
              <span
                className={isAvailableNow ? "glow-badge" : ""}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isAvailableNow ? accentColor : "#9CA3AF",
                  display: "block",
                }}
              />
              <span
                className="public-text-status"
                style={{
                  fontSize: 9,
                  color: "var(--public-text-dim)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {statusMessage}
              </span>
            </div>
          </div>

          {/* Nome e Função (Alinhados à direita do avatar) */}
          <div className="animate-stagger-2" style={{ paddingLeft: 128, paddingTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <h1
              className="public-text-name"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--public-text-main)",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {safeProfile.full_name}
            </h1>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--public-text-main)",
                marginTop: 4,
                letterSpacing: "0.01em",
              }}
            >
              {(safeProfile as any).job_title || "Consultor"}
            </h2>
          </div>

          {/* Bio (Centralizada abaixo de tudo) */}
          <div className="animate-stagger-2" style={{ textAlign: "center", marginTop: 24 }}>
            {bioLine ? (
              <p
                className="public-text-bio"
                style={{
                  fontSize: 14,
                  color: "var(--public-text-dim)",
                  fontWeight: 400,
                  lineHeight: 1.45,
                }}
              >
                {bioLine}
              </p>
            ) : null}
          </div>

          {/* Botão do WhatsApp (Movido para cá) */}
          {safeProfile.whatsapp && (
            <div className="animate-stagger-2" style={{ marginTop: 16, padding: "0 4px", width: "100%" }}>
              <ProfileWhatsAppButton
                profileId={safeProfile.id}
                slug={slug}
                whatsapp={safeProfile.whatsapp}
                isAvailable={isAvailableNow}
                acceptsMessagesWhenClosed={safeProfile.accepts_messages_when_closed ?? true}
              />
            </div>
          )}
          
          {/* Categorias em destaque */}
          {catalogStats.categories && catalogStats.categories.length > 0 && (
            <div className="animate-stagger-3 mt-6">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--public-text-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, textAlign: 'center' }}>
                Categorias
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                {catalogStats.categories.map((cat: any) => (
                  <Link 
                    key={cat.id} 
                    href={`/${slug}/catalogo?categoria=${cat.id}`}
                    style={{ 
                      width: 'calc(50% - 6px)',
                      minWidth: 130,
                      maxWidth: 160,
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'var(--public-glass-bg)',
                      border: '1px solid var(--public-card-border)',
                      borderRadius: 16,
                      padding: '16px 12px',
                      textDecoration: 'none',
                      color: 'var(--public-text-main)',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                    className="hover:-translate-y-1 hover:shadow-md"
                  >
                    {cat.icon_url ? (
                      <img src={cat.icon_url} alt={cat.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 8, background: accentColor + '20', color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                      </div>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{cat.name.split(" ")[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Botões CTA */}
          <div
            className="animate-stagger-3"
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <CatalogBadge 
              catalogId={catalogStats.catalogId || ""} 
              latestProductTimestamp={catalogStats.latestUpdate}
            >
              <Link
                href={`/${slug}/catalogo`}
                className="btn-catalog"
                style={{
                  display: "inline-flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                   background: "var(--public-glass-bg)",
                   border: "1px solid var(--public-card-border)",
                   borderRadius: 14,
                   padding: "14px 20px",
                   color: "var(--public-text-main)",
                   fontSize: 15,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <svg
                  width={17}
                  height={17}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  style={{ opacity: 0.6 }}
                >
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
                Ver catálogo
              </Link>
            </CatalogBadge>

            <PublicShareButton 
              title={safeProfile.full_name || "Perfil Digital"}
              text={safeProfile.bio || "Confira meu perfil e catálogo digital."}
              url={""} // O componente pegará a URL atual se estiver vazio
              className="btn-catalog"
              style={{ display: "inline-flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "transparent",
                border: "1px solid var(--public-card-border)",
                borderRadius: 14,
                padding: "12px 20px",
                color: "var(--public-text-dim)",
                fontSize: 13,
                fontWeight: 600,
                marginTop: 4,
                cursor: "pointer"
              }}
            />
          </div>

          {/* Redes Sociais */}
          <div
            className="animate-stagger-4 public-social-wrapper"
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            {orgRes.data?.social_instagram && (
              <a
                href={orgRes.data.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--public-glass-bg)",
                  border: "1px solid var(--public-card-border)",
                  color: "var(--public-text-main)",
                  transition: "all 0.2s",
                }}
                className="hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            )}
            {orgRes.data?.social_facebook && (
              <a
                href={orgRes.data.social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--public-glass-bg)",
                  border: "1px solid var(--public-card-border)",
                  color: "var(--public-text-main)",
                  transition: "all 0.2s",
                }}
                className="hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            )}
            {orgRes.data?.social_tiktok && (
              <a
                href={orgRes.data.social_tiktok}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--public-glass-bg)",
                  border: "1px solid var(--public-card-border)",
                  color: "var(--public-text-main)",
                  transition: "all 0.2s",
                }}
                className="hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a7 7 0 1 1-7-7z"/>
                </svg>
              </a>
            )}
            {orgRes.data?.social_youtube && (
              <a
                href={orgRes.data.social_youtube}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--public-glass-bg)",
                  border: "1px solid var(--public-card-border)",
                  color: "var(--public-text-main)",
                  transition: "all 0.2s",
                }}
                className="hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </a>
            )}
          </div>

          {/* Rodapé Integrado */}
          <div className="mt-6 flex flex-col items-center gap-3">
            {orgLogo && (
              <div className="flex justify-center opacity-60 hover:opacity-100 transition-opacity">
                <img src={orgLogo} alt={orgName || ""} className="h-6 w-auto object-contain" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#25D366",
                  opacity: 0.45,
                  display: "block",
                }}
              />
              <span
                className="public-text-footer"
                style={{
                  fontSize: 10,
                  color: "var(--public-text-muted)",
                  letterSpacing: "0.05em",
                }}
              >
                copyright plataformashop.com.br - 2026
              </span>
            </div>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
