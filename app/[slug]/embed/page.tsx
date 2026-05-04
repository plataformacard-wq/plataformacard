import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCatalogClient from "@/components/catalog/ProductCatalogClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// SEO Metadata for Embed (Simplified)
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  return {
    title: `Catálogo Embed | ${slug}`,
    robots: { index: false, follow: false } // Avoid indexing the embed version
  };
}

export default async function EmbedPage(props: PageProps) {
  const supabase = await createClient();
  const { slug } = await props.params;

  let profile: any = null;
  let orgData: any = null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp")
    .ilike("slug", slug)
    .maybeSingle();

  if (profileData) {
    profile = profileData;
    if (profile.organization_id) {
      const { data: orgRaw } = await supabase
        .from("organizations")
        .select("id, slug, name, favicon_url, logo_url, business_model, whatsapp, accent_color")
        .eq("id", profile.organization_id)
        .maybeSingle();
      if (orgRaw) orgData = orgRaw;
    }
  } else {
    const { data: orgRaw } = await supabase
      .from("organizations")
      .select("id, slug, name, favicon_url, logo_url, business_model, whatsapp, is_pure_catalog, accent_color")
      .ilike("slug", slug)
      .maybeSingle();

    if (orgRaw) {
      orgData = orgRaw;
    } else {
      return notFound();
    }
  }

  const trackingProfileId = profile?.id || ("caas-org-" + orgData?.id);
  const targetOrgId = profile?.organization_id || orgData?.id || profile?.id;

  let catalogId: string | null = null;

  // Busca catálogo (mesma lógica do catalogo/page.tsx)
  if (targetOrgId) {
    const { data: enabledCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", targetOrgId)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();

    catalogId = enabledCatalog?.catalog_id ?? null;
  }

  if (!catalogId && targetOrgId) {
    const { data: directCatalog } = await supabase
      .from("catalogs")
      .select("id")
      .eq("owner_id", targetOrgId)
      .limit(1)
      .maybeSingle();
    catalogId = directCatalog?.id ?? null;
  }

  if (!catalogId) return notFound();

  const { data: catalogData } = await supabase
    .from("catalogs")
    .select("id, name, description, catalog_type")
    .eq("id", catalogId)
    .maybeSingle();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, catalog_id, name, description, sort_order, specs_title, show_specs, show_colors, colors")
    .eq("catalog_id", catalogId)
    .order("sort_order", { ascending: true });

  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", targetOrgId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  let finalWhatsapp = profile?.whatsapp || orgData?.whatsapp || null;

  return (
    <div className="min-h-screen bg-white public-theme-invert">
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.removeAttribute('data-theme');`
        }}
      />
      <ProductCatalogClient
        profileId={trackingProfileId}
        catalogId={catalogId}
        slug={slug}
        fullName={profile?.full_name || orgData?.name}
        avatarUrl={profile?.avatar_url || orgData?.favicon_url}
        logoUrl={orgData?.logo_url}
        isPureCatalog={orgData?.business_model === "CaaS"}
        accentColor={orgData?.accent_color}
        isEmbed={true}
        catalogName={catalogData?.name || "Catálogo"}
        catalogDescription={catalogData?.description}
        categories={(categoriesData ?? []) as any}
        products={(productsData ?? []) as any}
        whatsapp={finalWhatsapp}
      />
    </div>
  );
}
