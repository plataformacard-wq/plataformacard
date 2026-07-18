"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";
import { revalidatePath } from "next/cache";
import { 
  updateSettingsSchema, 
  upsertTestimonialSchema, 
  upsertPartnerSchema 
} from "@/lib/validations/cms-schemas";

// --- SETTINGS ---
export async function getLandingSettings() {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("landing_page_settings")
    .select("*")
    .eq("is_singleton", true)
    .single();
    
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching settings:", error);
    return null;
  }
  return data;
}

export async function updateLandingSettings(payload: any) {
  const parsed = updateSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("landing_page_settings")
    .upsert({ 
      is_singleton: true, 
      ...parsed.data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'is_singleton' });

  if (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Erro ao salvar configurações" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

// --- TESTIMONIALS ---
export async function getTestimonials() {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("landing_page_testimonials")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
  return data || [];
}

export async function upsertTestimonial(payload: any) {
  const parsed = upsertTestimonialSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { id, ...rest } = parsed.data;
  
  const payloadToSave: any = { 
    ...rest, 
    updated_at: new Date().toISOString() 
  };
  
  if (id) {
    payloadToSave.id = id;
  }

  const { error } = await supabase
    .from("landing_page_testimonials")
    .upsert(payloadToSave);

  if (error) {
    console.error("Error upserting testimonial:", error);
    return { success: false, error: "Erro ao salvar depoimento" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("landing_page_testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao deletar depoimento" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

// --- PARTNERS ---
export async function getPartners() {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("landing_page_partners")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching partners:", error);
    return [];
  }
  return data || [];
}

export async function upsertPartner(payload: any) {
  const parsed = upsertPartnerSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { id, ...rest } = parsed.data;
  
  const payloadToSave: any = { 
    ...rest, 
    updated_at: new Date().toISOString() 
  };
  
  if (id) {
    payloadToSave.id = id;
  }

  const { error } = await supabase
    .from("landing_page_partners")
    .upsert(payloadToSave);

  if (error) {
    console.error("Error upserting partner:", error);
    return { success: false, error: "Erro ao salvar parceiro" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

export async function deletePartner(id: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("landing_page_partners")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao deletar parceiro" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}
