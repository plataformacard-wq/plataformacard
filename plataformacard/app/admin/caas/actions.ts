"use server";
 
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";

export async function assignMasterCatalog(orgId: string, catalogId: string | null) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  if (!catalogId) {
    // Se catalogId for null, desativamos o catálogo master (removemos o vínculo platform)
    const { error } = await supabase
      .from("organization_catalogs")
      .update({ is_enabled: false })
      .match({ organization_id: orgId }); // Simplificado para este exemplo, pode precisar de mais filtros
    
    if (error) {
      console.error("assignMasterCatalog update error:", error);
      return { success: false, error: "Falha ao remover catálogo." };
    }
  } else {
    // Primeiro, desativamos catálogos anteriores da org para evitar conflitos (opcional dependendo da regra)
    await supabase
      .from("organization_catalogs")
      .update({ is_enabled: false })
      .eq("organization_id", orgId);

    // Inserimos ou atualizamos o vínculo
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

  revalidatePath("/admin/caas");
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
    .eq('role', 'superadmin')
    .maybeSingle();

  if (!profile) {
    console.error("Super Admin Profile não encontrado");
    throw new Error("Falha ao identificar autoridade mestre.");
  }

  const { error } = await supabase
    .from("catalogs")
    .insert({
      name,
      description,
      catalog_type: "platform",
      owner_id: profile.id
    });

  if (error) {
    console.error("createMasterCatalog error:", error);
    throw new Error(`Erro ao criar catálogo master: ${error.message}`);
  }

  revalidatePath("/admin/caas");
  return { success: true };
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
  revalidatePath("/admin/caas");
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
  revalidatePath("/admin/caas");
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
  revalidatePath("/admin/caas");
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
  revalidatePath("/admin/caas");
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

  revalidatePath("/admin/caas");
  return { success: true };
}
