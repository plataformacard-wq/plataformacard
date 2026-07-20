"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(
  leadId: string,
  newStatus: "new_lead" | "open" | "negotiating" | "closed"
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado." };
    }

    // 1. Obter organização
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.organization_id) {
      return { error: "Organização não encontrada." };
    }

    const updatePayload: any = {
      crm_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "closed") {
      updatePayload.closed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("leads_tracking")
      .update(updatePayload)
      .eq("id", leadId)
      .eq("organization_id", profile.organization_id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/crm");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erro ao atualizar status do lead." };
  }
}

export async function closeLeadWithStockDeduction(
  leadId: string,
  productId: string | null,
  quantity: number,
  notes?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.organization_id) {
      return { error: "Organização não encontrada." };
    }

    // 1. Registrar fechamento do lead
    const { error: leadErr } = await supabase
      .from("leads_tracking")
      .update({
        crm_status: "closed",
        closed_at: new Date().toISOString(),
        stock_deducted: quantity,
        product_id: productId || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .eq("organization_id", profile.organization_id);

    if (leadErr) {
      return { error: leadErr.message };
    }

    // 2. Se um produto foi selecionado e a quantidade > 0, descontar do estoque
    if (productId && quantity > 0) {
      // Buscar quantidade atual
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .eq("organization_id", profile.organization_id)
        .maybeSingle();

      if (product) {
        const currentStock = product.stock_quantity ?? 0;
        const newStock = Math.max(0, currentStock - quantity);
        const { error: prodErr } = await supabase
          .from("products")
          .update({
            stock_quantity: newStock,
            is_in_stock: newStock > 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);

        if (prodErr) {
          return { error: "Lead fechado, mas erro ao atualizar estoque: " + prodErr.message };
        }
      }
    }

    revalidatePath("/dashboard/crm");
    revalidatePath("/dashboard/estoque");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erro ao fechar negócio com estoque." };
  }
}

export async function updateLeadDetails(
  leadId: string,
  clientName: string,
  clientWhatsapp: string,
  notes: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.organization_id) {
      return { error: "Organização não encontrada." };
    }

    const { error } = await supabase
      .from("leads_tracking")
      .update({
        client_name: clientName,
        client_whatsapp: clientWhatsapp,
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .eq("organization_id", profile.organization_id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/crm");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erro ao atualizar detalhes do lead." };
  }
}
