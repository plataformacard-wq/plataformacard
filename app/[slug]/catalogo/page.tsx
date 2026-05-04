import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCatalogClient from "@/components/catalog/ProductCatalogClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

type Profile = {
  id: string;
  slug: string;
  organization_id: string;
  full_name: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  bio: string | null;
  is_available: boolean | null;
  custom_business_hours: any;
};

type Organization = {
  id: string;
  slug: string;
  name: string;
  favicon_url: string | null;
  business_model: string;
  whatsapp?: string | null;
  accent_color?: string | null;
  secondary_color?: string | null;
  business_hours?: any;
};

type Catalog = {
  id: string;
  name: string;
  description: string | null;
  catalog_type: string | null;
};

type Category = {
  id: string;
  catalog_id: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
};

type Spec = {
  chave: string;
  valor: string;
};

type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  specs: Spec[] | null;
  price: number | null;
  compare_at_price: number | null;
  sku: string | null;
  has_retail: boolean | null;
  has_wholesale: boolean | null;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  is_extra: boolean | null;
  sort_order: number | null;
  is_in_stock: boolean | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
  created_at: string;
  updated_at: string;
};

// SEO Metadata Generation
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const isEmbed = searchParams.embed === "true";
  
  const supabase = await createClient();

  // Se for embed, evitamos indexação pesada ou títulos genéricos
  if (isEmbed) {
    return {
      title: "Catálogo Digital",
      robots: "noindex, nofollow"
    };
  }

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

  const title = orgData?.meta_title || (profile ? `Catálogo de ${profile.full_name}` : (orgData ? `Catálogo de ${orgData.name}` : "Catálogo")) + " | PlataformaCard";
  const description = orgData?.meta_description || (profile?.bio) || "Confira nossos produtos e ofertas exclusivas.";
  const iconBase = orgData?.favicon_url || "/favicon.ico";
  const icon = `${iconBase}${iconBase.includes('?') ? '&' : '?'}t=${Date.now()}`;

  return {
    title,
    description,
    icons: {
      icon: icon,
      shortcut: icon,
      apple: icon,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function Page(props: PageProps) {
  const admin = (await import("@/lib/supabase/admin")).createAdminClient();
  const supabase = await createClient();
  const { slug } = await props.params;

  let profile: Profile | null = null;
  let orgData: Organization | null = null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp, is_available, custom_business_hours")
    .ilike("slug", slug)
    .maybeSingle();

  if (profileData) {
    profile = profileData as Profile;
    if (profile.organization_id) {
      const { data: brandingData } = await admin
        .from("organizations")
        .select("id, slug, name, favicon_url, logo_url, business_model, whatsapp, is_pure_catalog, accent_color, secondary_color, business_hours")
        .eq("id", profile.organization_id)
        .maybeSingle();
      if (brandingData) {
        orgData = brandingData as any;
        console.log(`[DEBUG SERVER] Org found for ${slug}:`, { 
          id: orgData?.id, 
          accent: orgData?.accent_color,
          raw: brandingData.accent_color 
        });
      }
    }
  } else {
    const { data: brandingData } = await admin
      .from("organizations")
      .select("id, slug, name, favicon_url, logo_url, business_model, whatsapp, is_pure_catalog, accent_color, secondary_color, business_hours")
      .ilike("slug", slug)
      .maybeSingle();
      
    if (brandingData) {
      orgData = brandingData as any;
      console.log(`[DEBUG SERVER] Org found directly for slug ${slug}:`, { 
        id: orgData?.id, 
        accent: orgData?.accent_color 
      });
    } else {
      return notFound();
    }
  }

  const trackingProfileId = profile?.id || ("caas-org-" + orgData?.id);
  const targetOrgId = profile?.organization_id || orgData?.id || profile?.id;

  let catalogId: string | null = null;

  if (profile) {
    const { data: profileCatalogData } = await supabase
      .from("profile_catalogs")
      .select("organization_catalog_id")
      .eq("profile_id", profile.id)
      .eq("is_selected", true)
      .limit(1)
      .maybeSingle();

    if (profileCatalogData?.organization_catalog_id) {
      const { data: orgCatalogFromProfile } = await supabase
        .from("organization_catalogs")
        .select("catalog_id")
        .eq("id", profileCatalogData.organization_catalog_id)
        .maybeSingle();

      catalogId = orgCatalogFromProfile?.catalog_id ?? null;
    }
  }

  // Tenta primeiro catálogo habilitado
  if (!catalogId && targetOrgId) {
    const { data: enabledCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", targetOrgId)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();

    catalogId = enabledCatalog?.catalog_id ?? null;
  }

  // Fallback B2B/CaaS: pega qualquer catálogo da organização
  if (!catalogId && targetOrgId) {
    const { data: anyCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", targetOrgId)
      .limit(1)
      .maybeSingle();

    catalogId = anyCatalog?.catalog_id ?? null;
  }

  // Fallback de Segurança Máxima: Busca direta na tabela catalogs pelo owner_id
  if (!catalogId && targetOrgId) {
    const { data: directCatalog } = await supabase
      .from("catalogs")
      .select("id")
      .eq("owner_id", targetOrgId)
      .limit(1)
      .maybeSingle();

    catalogId = directCatalog?.id ?? null;
  }

  if (!catalogId) {
    return notFound();
  }



  const { data: catalogData } = await admin
    .from("catalogs")
    .select("id, name, description, catalog_type")
    .eq("id", catalogId)
    .maybeSingle();

  const catalog = (catalogData as Catalog) || { id: catalogId, name: "Catálogo", description: "" };

  const { data: categoriesData, error: catError } = await admin
    .from("categories")
    .select("id, catalog_id, name, description, sort_order, specs_title:default_specs_title, show_specs:show_specs_by_default, show_colors:show_colors_by_default")
    .eq("catalog_id", catalogId)
    .order("sort_order", { ascending: true });

  const categories = (categoriesData ?? []) as Category[];

  let products: Product[] = [];

  if (targetOrgId) {
    const { data: productsData } = await admin
      .from("products")
      .select(
        "id, category_id, name, description, specs, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, is_extra, sort_order, created_at, updated_at, is_in_stock, is_active, specs_title, show_specs, show_colors, colors"
      )
      .eq("organization_id", targetOrgId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    products = (productsData ?? []) as Product[];
  }

  // Triple-check fallback para o WhatsApp
  let finalWhatsapp = profile?.whatsapp || (orgData as any)?.whatsapp || null;

  if (!finalWhatsapp && targetOrgId) {
    // Busca o WhatsApp de qualquer admin dessa organização
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("whatsapp")
      .eq("organization_id", targetOrgId)
      .not("whatsapp", "is", null)
      .limit(1)
      .maybeSingle();
    
    if (adminProfile?.whatsapp) {
      finalWhatsapp = adminProfile.whatsapp;
    }
  }

  const searchParams = await props.searchParams;
  const isEmbed = searchParams.embed === "true";

  return (
    <>
      <ProductCatalogClient
        profileId={trackingProfileId}
        catalogId={catalog.id}
        slug={slug}
        fullName={profile?.full_name || orgData?.name}
        avatarUrl={profile?.avatar_url || orgData?.favicon_url}
        logoUrl={(orgData as any)?.logo_url}
        isPureCatalog={(orgData as any)?.business_model === "CaaS"}
        isEmbed={isEmbed}
        accentColor={orgData?.accent_color || (orgData as any)?.accent_color}
        secondaryColor={orgData?.secondary_color || (orgData as any)?.secondary_color}
        catalogName={catalog.name}
        catalogDescription={catalog.description}
        categories={categories}
        products={products}
        whatsapp={finalWhatsapp}
        bio={profile?.bio}
        isAvailable={profile?.is_available}
        businessHours={orgData?.business_hours}
        customBusinessHours={profile?.custom_business_hours}
      />
    </>
  );
}
