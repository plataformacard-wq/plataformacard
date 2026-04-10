import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCatalogClient from "@/components/catalog/ProductCatalogClient";

type PageProps = {
  params: { slug: string };
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
  catalog_type: string | null;
};

type Category = {
  id: string;
  catalog_id: string;
  name: string;
  sort_order: number | null;
};

type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_extra: boolean | null;
  sort_order: number | null;
};



export default async function Page({ params }: PageProps) {
  const supabase = await createClient();

  const { slug } = params;

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
    .select("catalog_id")
    .eq("profile_id", profile.id)
    .eq("is_enabled", true)
    .limit(1)
    .maybeSingle();

    let catalogId = profileCatalogData?.catalog_id ?? null;
    let fallbackOrgCatalog: { catalog_id: string } | null = null;

if (!catalogId) {
  const { data } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", profile.organization_id)
    .eq("is_enabled", true)
    .limit(1)
    .maybeSingle();

  fallbackOrgCatalog = data;
  catalogId = fallbackOrgCatalog?.catalog_id ?? null;
}

if (!catalogId) {
  return notFound();
}

  const { data: catalogData, error: catalogError } = await supabase
    .from("catalogs")
    .select("id, name, catalog_type")
    .eq("id", catalogId)
    .maybeSingle();

  if (catalogError || !catalogData) {
    return notFound();
  }

  const catalog = catalogData as Catalog;

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, catalog_id, name, sort_order")
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
        "id, category_id, name, description, price, image_url, is_extra, sort_order"
      )
      .in("category_id", categoryIds)
      .order("sort_order", { ascending: true });

    if (productsError) {
      return notFound();
    }

    products = (productsData ?? []) as Product[];
  }

  const productImages: [] = [];

  return (
    <ProductCatalogClient
      profileId={profile.id}
      catalogId={catalog.id}
      slug={profile.slug}
      categories={categories}
      products={products}
      productImages={productImages}
      whatsapp={profile.whatsapp}
    />
  );
}