"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  toggleInvoiceStatusSchema,
  generateManualInvoiceSchema,
  toggleAutoUpsellSchema,
} from "./validations/finance-schemas";

export async function getInvoices(orgId: string) {
  // Validate basic string orgId to prevent SQL/NoSQL injection artifacts
  const parsedOrgId = z.string().uuid().safeParse(orgId);
  if (!parsedOrgId.success) {
    console.error("ID de organização inválido:", parsedOrgId.error.issues);
    return [];
  }

  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("organization_id", parsedOrgId.data)
    .order("due_date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }

  return data || [];
}

export async function toggleInvoiceStatus(invoiceId: string, newStatus: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED") {
  const parsed = toggleInvoiceStatusSchema.safeParse({ invoiceId, newStatus });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await verifySuperAdmin();
  const supabase = createAdminClient();

  const updateData: any = { status: parsed.data.newStatus };
  if (parsed.data.newStatus === "PAID") {
    updateData.paid_at = new Date().toISOString();
  } else if (parsed.data.newStatus === "PENDING" || parsed.data.newStatus === "OVERDUE") {
    updateData.paid_at = null;
  }

  const { error } = await supabase
    .from("invoices")
    .update(updateData)
    .eq("id", parsed.data.invoiceId);

  if (error) {
    console.error("Erro ao atualizar status da fatura:", error);
    return { success: false, error: "Falha ao atualizar a fatura" };
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function generateManualInvoice(orgId: string, amount: number, description: string, dueDate: Date) {
  const parsed = generateManualInvoiceSchema.safeParse({ orgId, amount, description, dueDate });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("invoices")
    .insert({
      organization_id: parsed.data.orgId,
      amount: parsed.data.amount,
      description: parsed.data.description,
      due_date: parsed.data.dueDate.toISOString().split("T")[0],
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
  const parsed = toggleAutoUpsellSchema.safeParse({ orgId, enabled });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ auto_upsell_enabled: parsed.data.enabled })
    .eq("id", parsed.data.orgId);

  if (error) {
    console.error("Erro ao atualizar auto upsell:", error);
    return { success: false, error: "Falha ao salvar configuração" };
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}
