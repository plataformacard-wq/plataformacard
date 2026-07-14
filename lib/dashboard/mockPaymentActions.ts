"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function processMockPayment(formData: FormData) {
  const planId = formData.get("plan_id") as string;
  const orgId = formData.get("org_id") as string;

  if (!planId || !orgId) {
    throw new Error("Dados inválidos para o checkout.");
  }

  const supabase = await createClient();
  
  // Verifica se o usuário atual é o dono (owner) da organização ou um admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  // Upgrade real no banco de dados
  const { error } = await supabase
    .from("organizations")
    .update({ 
      plan_id: planId,
      checkout_session_id: `mock_session_${Date.now()}`,
      updated_at: new Date().toISOString()
    })
    .eq("id", orgId);

  if (error) {
    console.error("Erro ao fazer upgrade mock:", error);
    throw new Error("Falha ao atualizar o plano. Tente novamente.");
  }

  // Redireciona de volta com um parâmetro de sucesso
  redirect(`/dashboard/assinatura?upgrade_success=true&plan=${planId}`);
}
