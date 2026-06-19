"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";
import { revalidatePath } from "next/cache";

export async function getInvoices(orgId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("organization_id", orgId)
    .order("due_date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }

  return data || [];
}

export async function toggleInvoiceStatus(invoiceId: string, newStatus: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED") {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const updateData: any = { status: newStatus };
  if (newStatus === "PAID") {
    updateData.paid_at = new Date().toISOString();
  } else if (newStatus === "PENDING" || newStatus === "OVERDUE") {
    updateData.paid_at = null;
  }

  const { error } = await supabase
    .from("invoices")
    .update(updateData)
    .eq("id", invoiceId);

  if (error) {
    console.error("Erro ao atualizar status da fatura:", error);
    return { success: false, error: "Falha ao atualizar a fatura" };
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function generateManualInvoice(orgId: string, amount: number, description: string, dueDate: Date) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("invoices")
    .insert({
      organization_id: orgId,
      amount,
      description,
      due_date: dueDate.toISOString().split("T")[0],
      status: "PENDING"
    });

  if (error) {
    console.error("Erro ao gerar fatura manual:", error);
    return { success: false, error: "Falha ao gerar a fatura" };
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function toggleAutoUpsell(orgId: string, enabled: boolean) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ auto_upsell_enabled: enabled })
    .eq("id", orgId);

  if (error) {
    console.error("Erro ao atualizar auto upsell:", error);
    return { success: false, error: "Falha ao salvar configuração" };
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}
