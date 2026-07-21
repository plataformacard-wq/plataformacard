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

export async function updateProductColorStock(productId: string, colorName: string, newQuantity: number) {
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

    // Busca o produto e suas cores atuais
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("colors")
      .eq("id", productId)
      .eq("organization_id", profile.organization_id)
      .single();

    if (fetchError || !product) {
      return { error: "Produto não encontrado." };
    }

    const colors: any[] = Array.isArray(product.colors) ? product.colors : [];
    let found = false;

    const updatedColors = colors.map((c: any) => {
      const nameMatch = typeof c === "string" ? c === colorName : c.name === colorName;
      if (nameMatch) {
        found = true;
        if (typeof c === "string") {
          return { name: c, stock_quantity: newQuantity, is_in_stock: newQuantity > 0 };
        }
        return { ...c, stock_quantity: newQuantity, is_in_stock: newQuantity > 0 };
      }
      return c;
    });

    if (!found) {
      return { error: `Cor "${colorName}" não encontrada no produto.` };
    }

    // Soma o estoque de todas as cores ativas
    const totalStock = updatedColors.reduce((sum: number, c: any) => {
      const qty = typeof c.stock_quantity === "number" ? c.stock_quantity : 0;
      return sum + Math.max(0, qty);
    }, 0);

    const isInStock = totalStock > 0;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        colors: updatedColors,
        stock_quantity: totalStock,
        is_in_stock: isInStock,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)
      .eq("organization_id", profile.organization_id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/dashboard/estoque");
    return { success: true, totalStock, updatedColors };
  } catch (err: any) {
    return { error: err.message || "Erro ao atualizar estoque da cor." };
  }
}

