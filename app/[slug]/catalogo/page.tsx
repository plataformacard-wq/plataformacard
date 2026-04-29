import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PublicThemeToggle from "@/components/PublicThemeToggle";
import ProductCatalogClient from "@/components/catalog/ProductCatalogClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type Profile = {
  id: string;
  slug: string;
  organization_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
};

type Organization = {
  id: string;
  slug: string;
  name: string;
  favicon_url: string | null;
  business_model: string;
  whatsapp?: string | null;
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
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .ilike("slug", slug)
    .maybeSingle();

  if (profile) {
    return {
      title: `Catálogo de ${profile.full_name} | PlataformaCard`,
      description: profile.bio || `Confira os produtos e ofertas exclusivas no catálogo digital de ${profile.full_name}.`,
      openGraph: {
        title: `Catálogo de ${profile.full_name}`,
        description: profile.bio || `Confira os produtos e ofertas exclusivas no catálogo digital de ${profile.full_name}.`,
        type: "website",
      },
    };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, meta_title, meta_description")
    .ilike("slug", slug)
    .maybeSingle();

  if (org) {
    return {
      title: org.meta_title || `Catálogo de ${org.name} | PlataformaCard`,
      description: org.meta_description || `Confira os produtos e ofertas exclusivas no catálogo digital de ${org.name}.`,
      openGraph: {
        title: org.meta_title || `Catálogo de ${org.name}`,
        description: org.meta_description || `Confira os produtos e ofertas exclusivas no catálogo digital de ${org.name}.`,
        type: "website",
      },
    };
  }

  return { title: "Catálogo não encontrado" };
}

export default async function Page(props: PageProps) {
  const supabase = await createClient();
  const { slug } = await props.params;

  let profile: Profile | null = null;
  let orgData: Organization | null = null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp")
    .ilike("slug", slug)
    .maybeSingle();

  if (profileData) {
    profile = profileData as Profile;
    // Se o perfil existe, também precisamos dos dados da organização vinculada (para o WhatsApp, por exemplo)
    if (profile.organization_id) {
      const { data: orgRaw } = await supabase
        .from("organizations")
        .select("id, slug, name, favicon_url, business_model, whatsapp")
        .eq("id", profile.organization_id)
        .maybeSingle();
      if (orgRaw) orgData = orgRaw as Organization;
    }
  } else {
    const { data: orgRaw } = await supabase
      .from("organizations")
      .select("id, slug, name, favicon_url, business_model, whatsapp")
      .ilike("slug", slug)
      .maybeSingle();
      
    if (orgRaw) {
      orgData = orgRaw as Organization;
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

  const { data: catalogData } = await supabase
    .from("catalogs")
    .select("id, name, description, catalog_type")
    .eq("id", catalogId)
    .maybeSingle();

  const catalog = (catalogData as Catalog) || { id: catalogId, name: "Catálogo", description: "" };

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, catalog_id, name, description, sort_order, specs_title, show_specs, show_colors, colors")
    .eq("catalog_id", catalogId)
    .order("sort_order", { ascending: true });

  const categories = (categoriesData ?? []) as Category[];

  let products: Product[] = [];

  if (targetOrgId) {
    const { data: productsData } = await supabase
      .from("products")
      .select(
        "id, category_id, name, description, specs, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, is_extra, sort_order, created_at, updated_at, is_in_stock, specs_title, show_specs, show_colors, colors"
      )
      .eq("organization_id", targetOrgId)
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

  return (
    <>
      <PublicThemeToggle />
      <ProductCatalogClient
        profileId={trackingProfileId}
        catalogId={catalog.id}
        slug={slug}
        fullName={profile?.full_name || orgData?.name}
        avatarUrl={profile?.avatar_url || orgData?.favicon_url}
        catalogName={catalog.name}
        catalogDescription={catalog.description}
        categories={categories}
        products={products}
        whatsapp={finalWhatsapp}
      />
    </>
  );
}
