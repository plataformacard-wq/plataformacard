import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductCatalogClient from "@/components/catalog/ProductCatalogClient";
import ConsultantsBridge from "@/components/public/ConsultantsBridge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  can_customize_hours: boolean | null;
  whatsapp_template: string | null;
  status: string | null;
  redirect_leads: boolean | null;
  recess_ends_at: string | null;
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
  centralize_leads?: boolean | null;
};

type Catalog = {
  id: string;
  name: string;
  description: string | null;
  catalog_type: string | null;
  whatsapp_template: string | null;
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
  highlight_text?: string | null;
  show_highlight?: boolean | null;
  created_at: string;
  updated_at: string;
};

// SEO Metadata Generation
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const isEmbed = searchParams.embed === "true";
  
  const admin = createAdminClient();

  // Se for embed, evitamos indexação pesada ou títulos genéricos
  if (isEmbed) {
    return {
      title: "Catálogo Digital",
      robots: "noindex, nofollow"
    };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, bio, organization_id")
    .ilike("slug", slug)
    .maybeSingle();

  let orgData = null;
  if (profile?.organization_id) {
    const { data: org } = await admin
      .from("organizations")
      .select("name, meta_title, meta_description, favicon_url")
      .eq("id", profile.organization_id)
      .maybeSingle();
    orgData = org;
  } else {
    const { data: org } = await admin
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
  const admin = createAdminClient();
  const supabase = await createClient();
  
  const { slug } = await props.params;

  let profile: Profile | null = null;
  let orgData: Organization | null = null;

  const { data: profileData } = await admin
    .from("profiles")
    .select("*")
    .ilike("slug", slug)
    .maybeSingle();

  if (profileData) {
    profile = profileData as Profile;
    if (profile.organization_id) {
      const { data: brandingData } = await admin
        .from("organizations")
        .select("id, slug, name, favicon_url, logo_url, business_model, accent_color, secondary_color, business_hours, centralize_leads")
        .eq("id", profile.organization_id)
        .maybeSingle();
      if (brandingData) {
        orgData = brandingData as any;
      }
    }
  } else {
    const { data: brandingData } = await admin
      .from("organizations")
      .select("id, slug, name, favicon_url, logo_url, business_model, accent_color, secondary_color, business_hours, centralize_leads")
      .ilike("slug", slug)
      .maybeSingle();
      
    if (brandingData) {
      orgData = brandingData as any;
    } else {
      return notFound();
    }
  }

  const isRecessActive = profile?.recess_ends_at && new Date(profile.recess_ends_at) > new Date();
  const isTerminated = profile?.status === 'terminated';
  const isPaused = profile?.status === 'paused' || isRecessActive;
  const isRedirecting = !!profile?.redirect_leads;

  if (profile && (isTerminated || (isPaused && isRedirecting))) {
    return (
      <ConsultantsBridge
        profile={profile}
        orgName={orgData?.name || null}
        orgLogo={(orgData as any)?.logo_url || null}
        orgSlug={orgData?.slug || profile.organization_id}
        accentColor={orgData?.accent_color || "#25D366"}
        secondaryColor={orgData?.secondary_color || "#128C7E"}
        reason={isTerminated ? 'terminated' : 'paused'}
      />
    );
  }

  const trackingProfileId = (profile?.id || orgData?.id) || "";
  const targetOrgId = profile?.organization_id || orgData?.id || profile?.id;

  let catalogId: string | null = null;

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

  // PRIORIDADE 2: Vínculo Individual do Perfil (Caso não haja Master)
  if (!catalogId && profile) {
    const { data: profileCatalogData } = await admin
      .from("profile_catalogs")
      .select("organization_catalog_id")
      .eq("profile_id", profile.id)
      .eq("is_selected", true)
      .maybeSingle();

    if (profileCatalogData?.organization_catalog_id) {
      const { data: orgCatalogFromProfile } = await admin
        .from("organization_catalogs")
        .select("catalog_id")
        .eq("id", profileCatalogData.organization_catalog_id)
        .maybeSingle();

      catalogId = orgCatalogFromProfile?.catalog_id ?? null;
    }
  }

  // FALLBACK 3: Busca direta por owner_id
  if (!catalogId && targetOrgId) {
    const { data: directCatalog } = await admin
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
    .select("id, name, description, catalog_type, whatsapp_template")
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

  if (categories.length > 0) {
    const categoryIds = categories.map(c => c.id);
    
    const { data: productsData } = await admin
      .from("products")
      .select(
        "id, category_id, name, description, specs, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, is_extra, sort_order, created_at, updated_at, is_in_stock, is_active, specs_title, show_specs, show_colors, colors, highlight_text, show_highlight"
      )
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    products = (productsData ?? []) as Product[];
  }

  // Triple-check fallback para o WhatsApp
  // CRM KOMMO: Lógica de centralização de leads
  let finalWhatsapp = profile?.whatsapp || orgData?.whatsapp || null;
  
  if (orgData?.centralize_leads) {
    // Se a centralização estiver ativa, forçamos o WhatsApp da Organização para transbordo
    finalWhatsapp = orgData.whatsapp || profile?.whatsapp || null;
  }

  if (!finalWhatsapp && targetOrgId) {
    // Busca o WhatsApp de qualquer admin dessa organização
    const { data: adminProfile } = await admin
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
        catalogId={catalog.id || ""}
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
        canCustomizeHours={profile?.can_customize_hours}
        organizationId={targetOrgId}
        whatsappTemplate={profile?.whatsapp_template || catalog?.whatsapp_template}
        sellerStatus={profile?.status}
        recessEndsAt={profile?.recess_ends_at}
      />
    </>
  );
}
