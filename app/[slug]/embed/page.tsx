import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCatalogClient from "@/components/catalog/ProductCatalogClient";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        .select("id, slug, name, favicon_url, logo_url, business_model, accent_color, business_hours, centralize_leads")
        .eq("id", profile.organization_id)
        .maybeSingle();
      if (orgRaw) orgData = orgRaw;
    }
  } else {
    const { data: orgRaw } = await supabase
      .from("organizations")
      .select("id, slug, name, favicon_url, logo_url, business_model, accent_color, business_hours, centralize_leads")
      .ilike("slug", slug)
      .maybeSingle();

    if (orgRaw) {
      orgData = orgRaw;
    } else {
      return notFound();
    }
  }

  const trackingProfileId = (profile?.id || orgData?.id) || "";
  const targetOrgId = profile?.organization_id || orgData?.id || profile?.id;

  let catalogId: string | null = null;

  // Busca catálogo (mesma lógica do catalogo/page.tsx)
  // PRIORIDADE 1: Catálogo Master da Organização (CaaS/B2B Master)
  if (targetOrgId) {
    const { data: enabledCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", targetOrgId)
      .eq("is_enabled", true)
      .maybeSingle();

    if (enabledCatalog?.catalog_id) {
      catalogId = enabledCatalog.catalog_id;
    }
  }

  // FALLBACK 2: Busca direta por organization_id ou owner_id
  if (!catalogId && targetOrgId) {
    const { data: orgCatalog } = await supabase
      .from("catalogs")
      .select("id")
      .eq("organization_id", targetOrgId)
      .limit(1)
      .maybeSingle();

    if (orgCatalog?.id) {
      catalogId = orgCatalog.id;
    } else {
      const { data: ownerCatalog } = await supabase
        .from("catalogs")
        .select("id")
        .eq("owner_id", targetOrgId)
        .limit(1)
        .maybeSingle();

      if (ownerCatalog?.id) {
        catalogId = ownerCatalog.id;
      } else if (profile?.id) {
        const { data: profileCatalog } = await supabase
          .from("catalogs")
          .select("id")
          .eq("owner_id", profile.id)
          .limit(1)
          .maybeSingle();

        catalogId = profileCatalog?.id ?? null;
      }
    }
  }

  if (!catalogId) return notFound();

  const { data: catalogData } = await supabase
    .from("catalogs")
    .select("*")
    .eq("id", catalogId)
    .maybeSingle();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, catalog_id, name, description, sort_order, specs_title:default_specs_title, show_specs:show_specs_by_default, show_colors:show_colors_by_default")
    .eq("catalog_id", catalogId)
    .order("sort_order", { ascending: true });

  let productsData: any[] = [];
  if (categoriesData && categoriesData.length > 0) {
    const categoryIds = categoriesData.map(c => c.id);
    const { data: prods } = await supabase
      .from("products")
      .select("*")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    productsData = prods || [];
  }

  // CRM KOMMO: Lógica de centralização de leads
  let finalWhatsapp = profile?.whatsapp || orgData?.whatsapp || null;
  if (orgData?.centralize_leads) {
    finalWhatsapp = orgData.whatsapp || profile?.whatsapp || null;
  }

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; }
        main { 
          max-width: 1200px !important; 
          width: 100% !important; 
          margin: 0 auto !important; 
          box-sizing: border-box; 
        }
        main .max-w-5xl, main .max-w-6xl, main .max-w-2xl, main .max-w-xl { max-width: 100% !important; width: 100% !important; }
      ` }} />
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.removeAttribute('data-theme');`
        }}
      />
      <ProductCatalogClient
        profileId={trackingProfileId}
        catalogId={catalogId || ""}
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
        businessHours={orgData?.business_hours}
        hideCta={!!catalogData?.hide_cta}
      />
    </div>
  );
}
