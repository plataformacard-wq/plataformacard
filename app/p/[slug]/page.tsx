import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProfileViewTracker from "@/components/analytics/ProfileViewTracker";
import ProfileWhatsAppButton from "@/components/analytics/ProfileWhatsAppButton";

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
    const { data } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", profile.organization_id)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();

    catalogId = data?.catalog_id ?? null;
  }

  return catalogId;
}

async function getCatalogStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: ProfileRow
): Promise<{ productCount: number; categoryCount: number }> {
  const catalogId = await resolveCatalogId(supabase, profile);
  if (!catalogId) {
    return { productCount: 0, categoryCount: 0 };
  }

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id")
    .eq("catalog_id", catalogId);

  const categoryIds = (categoriesData ?? []).map((c) => c.id);
  const categoryCount = categoryIds.length;

  if (categoryIds.length === 0) {
    return { productCount: 0, categoryCount: 0 };
  }

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .in("category_id", categoryIds);

  return {
    productCount: productCount ?? 0,
    categoryCount,
  };
}

export default async function Page(props: PageProps) {
  const supabase = await createClient();

  const { slug } = await props.params;

  if (
    slug === "login" ||
    slug === "cadastro" ||
    slug === "dashboard" ||
    slug === "admin" ||
    slug === "auth" ||
    slug === "recuperar-senha" ||
    slug === "reset-senha" ||
    slug === "test"
  ) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const safeProfile = profile as ProfileRow;

  const [orgRes, catalogStats, analyticsRes] = await Promise.all([
    supabase
      .from("organizations")
      .select("name")
      .eq("id", safeProfile.organization_id)
      .maybeSingle(),
    getCatalogStats(supabase, safeProfile),
    supabase.rpc("get_profile_analytics_summary", {
      p_profile_id: safeProfile.id,
    }),
  ]);

  const orgName = orgRes.data?.name?.trim() ?? null;
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#141414] px-4 py-12">
      <ProfileViewTracker profileId={safeProfile.id} slug={slug} />

      <div className="w-full max-w-[400px] overflow-hidden rounded-[24px] bg-[#0f0f0f] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <header className="flex items-center justify-between px-7 py-7">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">
            anotameucontato.com.br
          </span>
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-[#25D366]"
            aria-hidden
          />
        </header>

        <div className="px-7 pb-8 text-center">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[18px] bg-[#1e1e1e] text-lg font-semibold tracking-tight text-white/80">
            {safeProfile.avatar_url ? (
              <img
                src={safeProfile.avatar_url}
                alt={safeProfile.full_name ?? "Foto do perfil"}
                className="h-full w-full object-cover"
              />
            ) : (
              initialsFromName(safeProfile.full_name)
            )}
          </div>

          <h1 className="mt-5 text-[26px] font-medium leading-tight text-white">
            {safeProfile.full_name}
          </h1>

          {bioLine ? (
            <p className="mt-2 px-1 text-[14px] leading-snug text-[#ffffff66]">
              {bioLine}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3">
            {safeProfile.whatsapp ? (
              <ProfileWhatsAppButton
                profileId={safeProfile.id}
                slug={slug}
                whatsapp={safeProfile.whatsapp}
              />
            ) : null}

            <Link
              href={`/p/${slug}/catalogo`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#ffffff22] bg-transparent px-4 py-3.5 text-[15px] font-medium text-white transition hover:bg-white/[0.04]"
            >
              <svg
                className="h-5 w-5 shrink-0 text-white/90"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
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
          </div>

          <div className="my-8 h-px w-full bg-[#ffffff11]" />

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[20px] font-medium tabular-nums text-white">
                {catalogStats.productCount}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#ffffff44]">
                Produtos
              </p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-medium tabular-nums text-white">
                {catalogStats.categoryCount}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#ffffff44]">
                Categorias
              </p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-medium tabular-nums text-white">
                {visitCount}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#ffffff44]">
                Visitas
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-10 flex items-center justify-center gap-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-black ring-1 ring-white/10" />
        <span className="text-[13px] text-white/40">
          anotameucontato.com.br
        </span>
      </footer>
    </main>
  );
}
