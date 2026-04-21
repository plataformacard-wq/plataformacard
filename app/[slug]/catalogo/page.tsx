import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  sku: string | null;
  has_wholesale: boolean | null;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  is_extra: boolean | null;
  sort_order: number | null;
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
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) return { title: "Catálogo não encontrado" };

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

export default async function Page(props: PageProps) {
  const supabase = await createClient();
  const { slug } = await props.params;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, slug, organization_id, full_name, bio, avatar_url, whatsapp")
    .eq("slug", slug)
    .maybeSingle();

  if (profileError || !profileData) {
    return notFound();
  }

  const profile = profileData as Profile;

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

  // Tenta primeiro catálogo habilitado
  if (!catalogId) {
    const { data: enabledCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", profile.organization_id)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();

    catalogId = enabledCatalog?.catalog_id ?? null;
  }

  // Fallback B2B: pega qualquer catálogo da organização
  if (!catalogId) {
    const { data: anyCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", profile.organization_id)
      .limit(1)
      .maybeSingle();

    catalogId = anyCatalog?.catalog_id ?? null;
  }

  if (!catalogId) {
    return notFound();
  }

  const { data: catalogData, error: catalogError } = await supabase
    .from("catalogs")
    .select("id, name, description, catalog_type")
    .eq("id", catalogId)
    .maybeSingle();

  if (catalogError || !catalogData) {
    return notFound();
  }

  const catalog = catalogData as Catalog;

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, catalog_id, name, description, sort_order")
    .eq("catalog_id", catalogId)
    .order("sort_order", { ascending: true });

  if (categoriesError || !categoriesData) {
    return notFound();
  }

  const categories = (categoriesData ?? []) as Category[];
  const categoryIds = categories.map((category) => category.id);

  let products: Product[] = [];

  if (categoryIds.length > 0) {
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(
        "id, category_id, name, description, specs, price, sku, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, is_extra, sort_order, created_at, updated_at"
      )
      .in("category_id", categoryIds)
      .order("sort_order", { ascending: true });

    if (productsError) {
      return notFound();
    }

    products = (productsData ?? []) as Product[];
  }

  return (
    <ProductCatalogClient
      profileId={profile.id}
      catalogId={catalog.id}
      slug={profile.slug}
      fullName={profile.full_name}
      avatarUrl={profile.avatar_url}
      catalogName={catalog.name}
      catalogDescription={catalog.description}
      categories={categories}
      products={products}
      whatsapp={profile.whatsapp}
    />
  );
}
