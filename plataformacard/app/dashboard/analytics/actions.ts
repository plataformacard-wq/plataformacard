"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCheckpointAction(organizationId: string, profileId: string, name: string = "Reset manual") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analytics_checkpoints")
    .insert({
      organization_id: organizationId,
      created_by: profileId,
      name,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar checkpoint:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/analytics");
  return { success: true, data };
}
