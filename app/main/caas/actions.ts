"use server";
 
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";

async function cleanupCaasOverrides(supabase: any, orgId: string) {
  // Find all catalogs of type 'platform'
  const { data: platformCatalogs } = await supabase
    .from("catalogs")
    .select("id")
    .eq("catalog_type", "platform");
  
  if (platformCatalogs && platformCatalogs.length > 0) {
    const catalogIds = platformCatalogs.map((c: any) => c.id);
    
    // Find all categories in these catalogs
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .in("catalog_id", catalogIds);
      
    if (categories && categories.length > 0) {
      const categoryIds = categories.map((c: any) => c.id);
      
      // Find all products in these categories
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .in("category_id", categoryIds);
        
      if (products && products.length > 0) {
        const productIds = products.map((p: any) => p.id);
        
        // Delete overrides for these products for this organization
        await supabase
          .from("organization_product_overrides")
          .delete()
          .eq("organization_id", orgId)
          .in("product_id", productIds);
      }
    }
  }
}

export async function assignMasterCatalog(orgId: string, catalogId: string | null) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  // Limpa overrides de catálogo CaaS antigo para evitar herança de preço incorreta/antiga
  try {
    await cleanupCaasOverrides(supabase, orgId);
  } catch (err) {
    console.error("Error in cleanupCaasOverrides:", err);
  }

  // 1. Busca os vínculos de catálogo para identificar o catálogo mestre e o próprio
  const { data: linked } = await supabase
    .from("organization_catalogs")
    .select("catalog_id, catalogs(catalog_type)")
    .eq("organization_id", orgId);

  const platformCatalogIds = linked
    ?.filter((item: any) => {
      const cat = Array.isArray(item.catalogs) ? item.catalogs[0] : item.catalogs;
      return cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS';
    })
    .map((item: any) => item.catalog_id);

  const ownCatalogLink = linked?.find((item: any) => {
    const cat = Array.isArray(item.catalogs) ? item.catalogs[0] : item.catalogs;
    return cat && cat.catalog_type !== 'platform' && cat.catalog_type !== 'CaaS';
  });

  // 2. Garante que o catálogo próprio esteja ativo (se existir) para corrigir desativações antigas
  if (ownCatalogLink) {
    await supabase
      .from("organization_catalogs")
      .update({ is_enabled: true })
      .eq("organization_id", orgId)
      .eq("catalog_id", ownCatalogLink.catalog_id);
  }

  // 3. Desativa os vínculos de catálogo master antigos (em vez de deletar para manter histórico/lógica de aviso)
  if (platformCatalogIds && platformCatalogIds.length > 0) {
    const { error } = await supabase
      .from("organization_catalogs")
      .update({ is_enabled: false })
      .eq("organization_id", orgId)
      .in("catalog_id", platformCatalogIds);

    if (error) {
      console.error("assignMasterCatalog delete platform error:", error);
      return { success: false, error: "Falha ao remover catálogo master anterior." };
    }
  }

  // 4. Se catalogId foi fornecido (novo catálogo master), insere/atualiza o vínculo
  if (catalogId) {
    const { error } = await supabase
      .from("organization_catalogs")
      .upsert({
        organization_id: orgId,
        catalog_id: catalogId,
        is_enabled: true,
      }, { onConflict: 'organization_id, catalog_id' });

    if (error) {
      console.error("assignMasterCatalog upsert error:", error);
      return { success: false, error: "Falha ao atribuir catálogo master." };
    }
  }

  revalidatePath("/main/caas");
  revalidatePath("/[slug]/catalogo", "layout");
  return { success: true };
}

export async function createMasterCatalog(name: string, description: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  // Busca o perfil do Super Admin para ser o dono do catálogo master
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'main_admin')
    .maybeSingle();

  if (!profile) {
    console.error("Super Admin Profile não encontrado");
    throw new Error("Falha ao identificar autoridade mestre.");
  }

  const { data: inserted, error } = await supabase
    .from("catalogs")
    .insert({
      name,
      description,
      catalog_type: "platform",
      owner_id: profile.id
    })
    .select("id")
    .single();

  if (error) {
    console.error("createMasterCatalog error:", error);
    throw new Error(`Erro ao criar catálogo master: ${error.message}`);
  }

  revalidatePath("/main/caas");
  return { success: true, id: inserted.id };
}

export async function getMasterCatalogAnalytics(catalogId: string) {
  await verifySuperAdmin();
  const admin = createAdminClient();

  // 1. Total de Cliques no WhatsApp (Leads) por Organização
  const { data: events, error } = await admin
    .from("analytics_events")
    .select("profile_id, event_type, metadata")
    .eq("catalog_id", catalogId)
    .eq("event_type", "whatsapp_click");

  if (error) {
    console.error("getMasterCatalogAnalytics error:", error);
    return [];
  }

  // Agrupar por profile_id (ou slug no metadata)
  const statsMap: Record<string, { count: number, slug: string }> = {};
  
  events.forEach(event => {
    const slug = event.metadata?.slug || "unknown";
    if (!statsMap[slug]) {
      statsMap[slug] = { count: 0, slug };
    }
    statsMap[slug].count++;
  });

  return Object.values(statsMap).sort((a, b) => b.count - a.count);
}

export async function updateMasterCatalog(
  id: string, 
  name: string, 
  description: string | null,
  type: string | null = 'product',
  whatsappTemplate: string | null = '',
  hideCta: boolean = false
) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("catalogs")
    .update({ 
      name, 
      description,
      type,
      whatsapp_template: whatsappTemplate,
      hide_cta: hideCta
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/main/caas");
  revalidatePath("/[slug]/catalogo", "layout");
  return { success: true };
}

export async function deleteMasterCatalog(id: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("catalogs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/main/caas");
  revalidatePath("/[slug]/catalogo", "layout");
  return { success: true };
}

export async function restoreMasterCatalog(id: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("catalogs")
    .update({ deleted_at: null })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/main/caas");
  revalidatePath("/[slug]/catalogo", "layout");
  return { success: true };
}

export async function permanentlyDeleteMasterCatalog(id: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  // Nota: Relações (categories, products) devem ter ON DELETE CASCADE no banco
  // ou precisamos deletar manualmente aqui.
  const { error } = await supabase
    .from("catalogs")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/main/caas");
  revalidatePath("/[slug]/catalogo", "layout");
  return { success: true };
}

export async function duplicateMasterCatalog(sourceId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  // 1. Busca catálogo original
  const { data: sourceCatalog, error: catError } = await supabase
    .from("catalogs")
    .select("*")
    .eq("id", sourceId)
    .single();

  if (catError || !sourceCatalog) throw new Error("Catálogo não encontrado.");

  // 2. Cria novo catálogo
  const { data: newCatalog, error: newCatError } = await supabase
    .from("catalogs")
    .insert({
      name: `${sourceCatalog.name} (Cópia)`,
      description: sourceCatalog.description,
      catalog_type: "platform",
      owner_id: sourceCatalog.owner_id
    })
    .select()
    .single();

  if (newCatError || !newCatalog) throw new Error("Erro ao criar cópia.");

  // 3. Duplica Categorias e seus Produtos
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("catalog_id", sourceId);

  if (categories && categories.length > 0) {
    for (const cat of categories) {
      const { data: newCat, error: newCatErr } = await supabase
        .from("categories")
        .insert({
          catalog_id: newCatalog.id,
          name: cat.name,
          description: cat.description,
          sort_order: cat.sort_order,
          default_specs_title: cat.default_specs_title,
          show_specs_by_default: cat.show_specs_by_default,
          show_colors_by_default: cat.show_colors_by_default
        })
        .select()
        .single();

      if (newCat && !newCatErr) {
        // Busca e duplica produtos desta categoria
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", cat.id);

        if (products && products.length > 0) {
          const productsToInsert = products.map(p => ({
            category_id: newCat.id,
            name: p.name,
            description: p.description,
            price: p.price,
            old_price: p.old_price,
            images: p.images,
            is_active: p.is_active,
            sort_order: p.sort_order,
            sku: p.sku,
            specifications: p.specifications,
            colors: p.colors
          }));

          await supabase.from("products").insert(productsToInsert);
        }
      }
    }
  }

  revalidatePath("/main/caas");
  return { success: true };
}

export async function toggleCaasDetachmentPermission(orgId: string, isAllowed: boolean) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("organization_catalogs")
    .update({ allow_caas_detachment: isAllowed })
    .eq("organization_id", orgId)
    .eq("is_enabled", true);

  if (error) {
    console.error("toggleCaasDetachmentPermission error:", error);
    throw new Error("Erro ao atualizar permissão de desvinculação.");
  }
  revalidatePath("/main/caas");
  return { success: true };
}
