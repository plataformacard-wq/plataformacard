import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  try {
    const admin = createAdminClient();
    const supabase = await createClient();
    const { slug } = await props.params;

    let profile: any = null;
    let orgData: any = null;

    const { data: profileData } = await admin
      .from("profiles")
      .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp")
      .ilike("slug", slug)
      .maybeSingle();

    if (profileData) {
      profile = profileData;
      if (profile.organization_id) {
        const { data: orgRaw } = await admin
          .from("organizations")
          .select("id, slug, name, favicon_url, logo_url, business_model, accent_color, business_hours, centralize_leads")
          .eq("id", profile.organization_id)
          .maybeSingle();
        if (orgRaw) orgData = orgRaw;
      }
    } else {
      const { data: orgRaw } = await admin
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
      const { data: enabledCatalog } = await admin
        .from("organization_catalogs")
        .select("catalog_id")
        .eq("organization_id", targetOrgId)
        .eq("is_enabled", true)
        .maybeSingle();

      if (enabledCatalog?.catalog_id) {
        catalogId = enabledCatalog.catalog_id;
      }
    }

    // FALLBACK 2: Busca direta por owner_id
    if (!catalogId && targetOrgId) {
      const { data: directCatalog } = await admin
        .from("catalogs")
        .select("id")
        .eq("owner_id", targetOrgId)
        .limit(1)
        .maybeSingle();
      catalogId = directCatalog?.id ?? null;
    }

    if (!catalogId) return notFound();

    const { data: catalogData } = await admin
      .from("catalogs")
      .select("id, name, description, catalog_type")
      .eq("id", catalogId)
      .maybeSingle();

    const { data: categoriesData } = await admin
      .from("categories")
      .select("id, catalog_id, name, description, sort_order, specs_title:default_specs_title, show_specs:show_specs_by_default, show_colors:show_colors_by_default")
      .eq("catalog_id", catalogId)
      .order("sort_order", { ascending: true });

    let productsData: any[] = [];
    if (categoriesData && categoriesData.length > 0) {
      const categoryIds = categoriesData.map(c => c.id);
      const { data: prods } = await admin
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
          main { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding-left: 12px !important; padding-right: 12px !important; }
          .max-w-5xl, .max-w-6xl, .max-w-2xl, .max-w-xl { max-width: 100% !important; width: 100% !important; }
          .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
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
        />
      </div>
    );
  } catch (err: any) {
    const envDiagnostics = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "DEFINED (length: " + process.env.NEXT_PUBLIC_SUPABASE_URL.length + ")" : "UNDEFINED",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "DEFINED (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "UNDEFINED",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "DEFINED (length: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "UNDEFINED",
    };

    return (
      <div style={{ padding: "20px", fontFamily: "monospace", color: "#e06c75", background: "#282c34", minHeight: "100vh" }}>
        <h1 style={{ color: "#e5c07b" }}>[DEBUG] Server-Side Exception in EmbedPage</h1>
        <p><strong>Error Message:</strong> {err?.message || "Unknown error"}</p>
        <p><strong>Stack Trace:</strong></p>
        <pre style={{ background: "#21252b", padding: "15px", borderRadius: "5px", overflowX: "auto" }}>
          {err?.stack || "No stack trace available"}
        </pre>
        <h2 style={{ color: "#61afef", marginTop: "30px" }}>Environment Variables Check:</h2>
        <pre style={{ background: "#21252b", padding: "15px", borderRadius: "5px" }}>
          {JSON.stringify(envDiagnostics, null, 2)}
        </pre>
      </div>
    );
  }
}
