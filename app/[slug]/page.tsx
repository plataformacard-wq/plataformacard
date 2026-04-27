import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProfileViewTracker from "@/components/analytics/ProfileViewTracker";
import ProfileWhatsAppButton from "@/components/analytics/ProfileWhatsAppButton";
import { getBusinessStatus, BusinessHours } from "@/lib/utils/time";
import CatalogBadge from "@/components/catalog/CatalogBadge";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
};

export const dynamicParams = true;
export const revalidate = 0;

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

async function resolveCatalogId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: ProfileRow
): Promise<string | null> {
  const { data: profileCatalogData } = await supabase
    .from("profile_catalogs")
    .select("organization_catalog_id")
    .eq("profile_id", profile.id)
    .eq("is_selected", true)
    .limit(1)
    .maybeSingle();

  let catalogId: string | null = null;

  if (profileCatalogData?.organization_catalog_id) {
    const { data: orgCatalogFromProfile } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("id", profileCatalogData.organization_catalog_id)
      .maybeSingle();

    catalogId = orgCatalogFromProfile?.catalog_id ?? null;
  }

  if (!catalogId) {
    // Tenta primeiro catálogo habilitado
    const { data: enabledCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", profile.organization_id)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();

    catalogId = enabledCatalog?.catalog_id ?? null;

    // Fallback B2B: se não há catálogo habilitado, pega qualquer catálogo da organização
    if (!catalogId) {
      const { data: anyCatalog } = await supabase
        .from("organization_catalogs")
        .select("catalog_id")
        .eq("organization_id", profile.organization_id)
        .limit(1)
        .maybeSingle();

      catalogId = anyCatalog?.catalog_id ?? null;
    }
  }

  return catalogId;
}

async function getCatalogStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: ProfileRow
): Promise<{ productCount: number; categoryCount: number; latestUpdate: string | null; catalogId: string | null }> {
  const catalogId = await resolveCatalogId(supabase, profile);
  if (!catalogId) {
    return { productCount: 0, categoryCount: 0, latestUpdate: null, catalogId: null };
  }

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id")
    .eq("catalog_id", catalogId);

  const categoryIds = (categoriesData ?? []).map((c) => c.id);
  const categoryCount = categoryIds.length;

  if (categoryIds.length === 0) {
    return { productCount: 0, categoryCount: 0, latestUpdate: null, catalogId };
  }

  const [{ count: productCount }, { data: latestProduct }] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .in("category_id", categoryIds),
    supabase
      .from("products")
      .select("created_at, updated_at")
      .in("category_id", categoryIds)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  return {
    productCount: productCount ?? 0,
    categoryCount,
    latestUpdate: latestProduct?.updated_at || latestProduct?.created_at || null,
    catalogId,
  };
}

export default async function Page(props: PageProps) {
  const supabase = await createClient();

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
    .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp, is_available, custom_business_hours")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id, slug, business_model")
      .eq("slug", slug)
      .eq("business_model", "CaaS")
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
      .select("name, business_hours")
      .eq("id", safeProfile.organization_id)
      .maybeSingle(),
    getCatalogStats(supabase, safeProfile),
    supabase.rpc("get_profile_analytics_summary", {
      p_profile_id: safeProfile.id,
    }),
  ]);

  const orgName = orgRes.data?.name?.trim() ?? null;
  const orgBusinessHours = (orgRes.data?.business_hours as unknown as BusinessHours) ?? null;
  const customBusinessHours = (safeProfile.custom_business_hours as unknown as BusinessHours) ?? null;
  
  // Decide if we use the profile's manual override or the organization's business hours
  // Fase 2: Herança de Horários
  const activeHours = customBusinessHours || orgBusinessHours;
  const businessStatus = getBusinessStatus(activeHours);
  
  // Se o perfil estava com is_available = false (manual), forçamos o fechamento. 
  // Caso contrário, seguimos a regra.
  const isAvailableNow = safeProfile.is_available === false ? false : businessStatus.isOpenNow;
  const statusMessage = safeProfile.is_available === false ? "Pausado" : businessStatus.message;

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
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 100% 45% at 50% -15%, #0d3b1f 0%, #0a0a0a 80%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
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
          from { box-shadow: 0 0 6px #25D366; }
          to { box-shadow: 0 0 12px #25D366, 0 0 2px #fff; }
        }
      `}</style>
      <ProfileViewTracker profileId={safeProfile.id} slug={slug} />

      {/* Card */}
      <div
        className="animate-stagger-1"
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 32,
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Barra verde de destaque no topo */}
        <div
          style={{
            height: 3,
            background:
              "linear-gradient(90deg, transparent 0%, #25D366 40%, #128C7E 60%, transparent 100%)",
          }}
        />

        <div style={{ padding: "36px 28px 32px" }}>
          {/* Avatar com anel brilhante */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", width: 92, height: 92 }}>
              {/* Anel externo brilhante */}
              <div
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: "50%",
                  background:
                    "conic-gradient(from 0deg, #25D366 0%, #128C7E 40%, rgba(37,211,102,0.1) 60%, #25D366 100%)",
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
                  border: "3px solid #0a0a0a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "-0.02em",
                }}
              >
                {safeProfile.avatar_url ? (
                  <img
                    src={safeProfile.avatar_url}
                    alt={safeProfile.full_name ?? "Foto do perfil"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  initialsFromName(safeProfile.full_name)
                )}
              </div>
            </div>

            {/* Badge DISPONÍVEL / PAUSADO / ABERTO AGORA */}
            <div
              style={{
                marginTop: -10,
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(0,0,0,0.75)",
                border: `1px solid ${isAvailableNow ? "rgba(37,211,102,0.25)" : "rgba(156,163,175,0.25)"}`,
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              <span
                className={isAvailableNow ? "glow-badge" : ""}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isAvailableNow ? "#25D366" : "#9CA3AF",
                  display: "block",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {statusMessage}
              </span>
            </div>
          </div>

          {/* Nome e bio */}
          <div className="animate-stagger-2" style={{ textAlign: "center", marginTop: 20 }}>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {safeProfile.full_name}
            </h1>

            {bioLine ? (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 400,
                  lineHeight: 1.55,
                }}
              >
                {bioLine}
              </p>
            ) : null}
          </div>

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
            {safeProfile.whatsapp ? (
              <ProfileWhatsAppButton
                profileId={safeProfile.id}
                slug={slug}
                whatsapp={safeProfile.whatsapp}
              />
            ) : <p style={{color: 'red'}}>WhatsApp is NULL</p>}

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
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 14,
                  padding: "14px 20px",
                  color: "rgba(255,255,255,0.9)",
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
          </div>

          {/* Stats */}
          <div
            className="animate-stagger-4"
            style={{
              marginTop: 28,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {[
              { value: catalogStats.productCount, label: "Produtos" },
              { value: catalogStats.categoryCount, label: "Categorias" },
              { value: visitCount, label: "Visitas" },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-block"
                style={{
                  padding: "18px 8px",
                  textAlign: "center",
                  borderRight:
                    i < 2 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                }}
              >
                <p
                  className="stat-value"
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    margin: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.28)",
                    margin: "5px 0 0",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer
        className="animate-stagger-5"
        style={{
          marginTop: 36,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
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
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "0.05em",
          }}
        >
          anotameucontato.com.br
        </span>
      </footer>
    </main>
  );
}
