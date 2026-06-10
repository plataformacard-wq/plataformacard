import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  hide_cta?: boolean | null;
  hide_prices?: boolean | null;
  owner_id?: string | null;
  organization_id?: string | null;
  banners?: any[] | null;
  banner_speed_seconds?: number | null;
  banner_initial_index?: number | null;
  show_banners?: boolean | null;
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
  const supabase = await createClient();
  
  const { slug } = await props.params;

  let profile: Profile | null = null;
  let orgData: Organization | null = null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .ilike("slug", slug)
    .maybeSingle();

  if (profileData) {
    profile = profileData as Profile;
    if (profile.organization_id) {
      const { data: brandingData } = await supabase
        .from("organizations")
        .select("id, slug, name, favicon_url, logo_url, business_model, accent_color, secondary_color, business_hours, centralize_leads, whatsapp")
        .eq("id", profile.organization_id)
        .maybeSingle();
      if (brandingData) {
        orgData = brandingData as any;
      }
    }
  } else {
    const { data: brandingData } = await supabase
      .from("organizations")
      .select("id, slug, name, favicon_url, logo_url, business_model, accent_color, secondary_color, business_hours, centralize_leads, whatsapp")
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

  let catalogIds: string[] = [];
  let primaryCatalogId: string | null = null;

  // PRIORIDADE 1: Catálogos Master/Próprios habilitados
  if (targetOrgId) {
    const { data: enabledCatalogs } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", targetOrgId)
      .eq("is_enabled", true);
      
    if (enabledCatalogs && enabledCatalogs.length > 0) {
      catalogIds = enabledCatalogs.map(c => c.catalog_id);
    }
  }

  // PRIORIDADE 2: Vínculo Individual do Perfil (Caso não haja catálogos habilitados na ORG)
  if (catalogIds.length === 0 && profile) {
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
  }

  // FALLBACK 3: Busca direta por organization_id ou owner_id
  if (catalogIds.length === 0 && targetOrgId) {
    const { data: orgCatalog } = await supabase
      .from("catalogs")
      .select("id")
      .eq("organization_id", targetOrgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orgCatalog?.id) {
      catalogIds.push(orgCatalog.id);
    } else {
      const { data: ownerCatalog } = await supabase
        .from("catalogs")
        .select("id")
        .eq("owner_id", targetOrgId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ownerCatalog?.id) {
        catalogIds.push(ownerCatalog.id);
      } else if (profile?.id) {
        const { data: profileCatalog } = await supabase
          .from("catalogs")
          .select("id")
          .eq("owner_id", profile.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (profileCatalog?.id) catalogIds.push(profileCatalog.id);
      }
    }
  }

  if (catalogIds.length === 0) {
    return (
      <ConsultantsBridge
        profile={profile || { id: orgData?.id, organization_id: orgData?.id }}
        orgName={orgData?.name || null}
        orgLogo={(orgData as any)?.logo_url || null}
        orgSlug={orgData?.slug || profile?.organization_id || ""}
        accentColor={orgData?.accent_color || "#25D366"}
        secondaryColor={orgData?.secondary_color || "#128C7E"}
        reason="unavailable"
      />
    );
  }

  const { data: catalogsData } = await supabase
    .from("catalogs")
    .select("*")
    .in("id", catalogIds)
    .is("deleted_at", null);

  const catalogs = (catalogsData || []) as Catalog[];
  const primaryCatalog = catalogs.find(c => c.catalog_type === 'CaaS' || c.catalog_type === 'platform')
    || catalogs.find(c => c.catalog_type !== 'CaaS' && c.catalog_type !== 'platform')
    || catalogs[0];
  if (!primaryCatalog) {
    return (
      <ConsultantsBridge
        profile={profile || { id: orgData?.id, organization_id: orgData?.id }}
        orgName={orgData?.name || null}
        orgLogo={(orgData as any)?.logo_url || null}
        orgSlug={orgData?.slug || profile?.organization_id || ""}
        accentColor={orgData?.accent_color || "#25D366"}
        secondaryColor={orgData?.secondary_color || "#128C7E"}
        reason="unavailable"
      />
    );
  }

  // Filtra catalogIds para conter apenas os IDs dos catálogos que não estão na lixeira
  catalogIds = catalogs.map(c => c.id);

  const catalog = primaryCatalog;
  // Se QUALQUER catálogo assinado estiver com hide_prices = true, consideramos verdadeiro.
  const anyHidePrices = catalogs.some(c => c.hide_prices);
  if (anyHidePrices) {
    catalog.hide_prices = true;
  }

  // Banners prioritization: User's custom catalog takes precedence over CaaS master catalog
  const customCatalog = catalogs.find(c => c.catalog_type !== 'CaaS' && c.catalog_type !== 'platform');
  const forceHideBanners = customCatalog && customCatalog.show_banners === false;
  
  const catalogWithBanners = (!forceHideBanners && customCatalog && customCatalog.banners && customCatalog.banners.length > 0) ? customCatalog : catalog;
  const finalBanners = catalogWithBanners.banners || [];
  const finalBannerSpeed = catalogWithBanners.banner_speed_seconds || 5;
  const finalBannerInitialIndex = catalogWithBanners.banner_initial_index || 0;
  const finalShowBanners = forceHideBanners ? false : (catalogWithBanners.show_banners !== false);

  const { data: categoriesData, error: catError } = await supabase
    .from("categories")
    .select("id, catalog_id, name, description, sort_order, specs_title:default_specs_title, show_specs:show_specs_by_default, show_colors:show_colors_by_default")
    .in("catalog_id", catalogIds)
    .order("sort_order", { ascending: true });

  const categories = (categoriesData ?? []) as Category[];

  let products: Product[] = [];
  let overrides: any[] = [];

  if (categories.length > 0) {
    const categoryIds = categories.map(c => c.id);
    
    const { data: productsData } = await supabase
      .from("products")
      .select(
        "id, category_id, name, description, specs, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, is_extra, sort_order, created_at, updated_at, is_in_stock, is_active, specs_title, show_specs, show_colors, colors, highlight_text, show_highlight"
      )
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    const fetchedProducts = (productsData ?? []) as Product[];

    // Fetch overrides se o usuário pertence a uma organização
    if (targetOrgId) {
      const { data: overridesData } = await supabase
        .from("organization_product_overrides")
        .select("*")
        .eq("organization_id", targetOrgId)
        .in("product_id", fetchedProducts.map(p => p.id));
        
      overrides = overridesData || [];
    }

    const caasCatalogIds = catalogs
      .filter(c => {
        const isCaasType = c.catalog_type === 'CaaS' || c.catalog_type === 'platform';
        if (!isCaasType) return false;
        
        // Se for do próprio perfil ou organização que está visualizando, não é CaaS para ele
        const isOwner = (profile && c.owner_id === profile.id) || (orgData && c.organization_id === orgData.id);
        return !isOwner;
      })
      .map(c => c.id);
    const caasCategoryIds = categories.filter(c => caasCatalogIds.includes(c.catalog_id)).map(c => c.id);

    products = fetchedProducts.reduce((acc, product) => {
      const isCaasProduct = caasCategoryIds.includes(product.category_id);
      
      if (isCaasProduct) {
        const override = overrides.find(o => o.product_id === product.id);
        if (!override || override.is_available === false) {
          return acc; // Não renderiza se não tem override ou está desativado pelo franqueado
        }
        
        // Aplica overrides
        acc.push({
          ...product,
          category_id: override.category_id !== null && override.category_id !== undefined ? override.category_id : product.category_id,
          price: (override.price_b2c !== null && override.price_b2c !== undefined) ? override.price_b2c : null,
          wholesale_price: (override.price_b2b !== null && override.price_b2b !== undefined) ? override.price_b2b : null,
          compare_at_price: (override.compare_at_price !== null && override.compare_at_price !== undefined) ? override.compare_at_price : null,
          has_retail: override.has_retail !== null ? override.has_retail : product.has_retail,
          has_wholesale: override.has_wholesale !== null ? override.has_wholesale : product.has_wholesale,
          sort_order: override.sort_order !== null ? override.sort_order : product.sort_order,
          image_url: override.image_url !== null && override.image_url !== undefined ? override.image_url : product.image_url,
          image_urls: override.image_urls !== null && override.image_urls !== undefined && override.image_urls.length > 0 ? override.image_urls : product.image_urls,
          sku: null
        });
      } else {
        acc.push(product);
      }
      return acc;
    }, [] as Product[]);
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
      {isEmbed && (
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
      )}
      <ProductCatalogClient
        profileId={trackingProfileId}
        catalogId={catalog.id || ""}
        slug={slug}
        fullName={profile?.full_name || orgData?.name}
        avatarUrl={profile?.avatar_url || orgData?.favicon_url}
        logoUrl={(orgData as any)?.logo_url}
        isPureCatalog={(orgData as any)?.business_model === "CaaS"}
        isB2B={(orgData as any)?.business_model === "B2B"}
        hidePrices={catalog.hide_prices || false}
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
        hideCta={!!catalog?.hide_cta}
        banners={finalBanners}
        bannerSpeedSeconds={finalBannerSpeed}
        bannerInitialIndex={finalBannerInitialIndex}
        showBanners={finalShowBanners}
      />
    </>
  );
}
