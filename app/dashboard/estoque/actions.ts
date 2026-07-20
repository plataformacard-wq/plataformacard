"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProductStock(productId: string, quantity: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado." };
    }

    // 1. Obter a organização do usuário logado
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.organization_id) {
      return { error: "Organização não encontrada." };
    }

    // 2. Atualizar a quantidade em estoque e o status de disponibilidade
    const isInStock = quantity > 0;
    const { error } = await supabase
      .from("products")
      .update({
        stock_quantity: quantity,
        is_in_stock: isInStock,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)
      .eq("organization_id", profile.organization_id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard/estoque");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erro desconhecido ao atualizar estoque." };
  }
}
