"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";
import { revalidatePath } from "next/cache";
import { 
  updateSettingsSchema, 
  upsertTestimonialSchema, 
  upsertPartnerSchema,
  upsertFaqSchema,
  upsertPlanSchema
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
  // Limpar strings vazias para null para evitar erros de validação Zod e no banco
  const sanitizedPayload = { ...payload };
  Object.keys(sanitizedPayload).forEach(key => {
    if (sanitizedPayload[key] === "") {
      sanitizedPayload[key] = null;
    }
  });

  const parsed = updateSettingsSchema.safeParse(sanitizedPayload);
  if (!parsed.success) {
    console.error("Validation error updating settings:", parsed.error.issues);
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
    console.error("Error updating settings in DB:", error);
    return { success: false, error: `Erro no banco de dados: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

async function uploadToStorageHelper(filePath: string, file: File): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const supabase = createAdminClient();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const bucketsToTry = ["catalogs", "public-assets", "products", "banners"];
  let lastErrorMsg = "";

  for (const bucketName of bucketsToTry) {
    // 1. Tenta upload direto com Buffer
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, { upsert: true, contentType: file.type || "image/png" });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return { success: true, publicUrl };
    }

    lastErrorMsg = error.message;

    // 2. Se o erro for de bucket inexistente, tenta criar o bucket público automaticamente
    try {
      await supabase.storage.createBucket(bucketName, { public: true });
      const retry = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, { upsert: true, contentType: file.type || "image/png" });

      if (!retry.error) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        return { success: true, publicUrl };
      }
      lastErrorMsg = retry.error.message;
    } catch (err: any) {
      console.error(`Erro ao tentar auto-criar bucket ${bucketName}:`, err);
    }
  }

  console.error("Storage upload error final:", lastErrorMsg);
  return { success: false, error: `Erro no servidor de arquivos: ${lastErrorMsg || 'Falha ao salvar no storage'}` };
}

export async function uploadHeroMockup(formData: FormData, themeType: 'dark' | 'light' = 'dark') {
  await verifySuperAdmin();
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "Nenhum arquivo selecionado" };
  }

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `hero_mockup_${themeType}_${Date.now()}.${fileExt}`;
  const filePath = `landing-page/${fileName}`;

  return await uploadToStorageHelper(filePath, file);
}

export async function uploadHeaderLogo(formData: FormData, themeType: 'dark' | 'light') {
  await verifySuperAdmin();
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "Nenhum arquivo selecionado" };
  }

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `logo_${themeType}_${Date.now()}.${fileExt}`;
  const filePath = `landing-page/${fileName}`;

  return await uploadToStorageHelper(filePath, file);
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

// --- FAQs ---
export async function getFaqs() {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("landing_page_faqs")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
  return data || [];
}

export async function upsertFaq(payload: any) {
  const parsed = upsertFaqSchema.safeParse(payload);
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
    .from("landing_page_faqs")
    .upsert(payloadToSave);

  if (error) {
    console.error("Error upserting FAQ:", error);
    return { success: false, error: "Erro ao salvar FAQ" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

export async function deleteFaq(id: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("landing_page_faqs")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao deletar FAQ" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

// --- PLANS ---
export async function getPlans() {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("landing_page_plans")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching Plans:", error);
    return [];
  }
  return data || [];
}

export async function upsertPlan(payload: any) {
  const parsed = upsertPlanSchema.safeParse(payload);
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
    .from("landing_page_plans")
    .upsert(payloadToSave);

  if (error) {
    console.error("Error upserting Plan:", error);
    return { success: false, error: "Erro ao salvar Plano" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

export async function deletePlan(id: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("landing_page_plans")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao deletar Plano" };
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}

export async function reorderPlans(orderedIds: string[]) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i];
    await supabase
      .from("landing_page_plans")
      .update({ display_order: i + 1, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  revalidatePath("/");
  revalidatePath("/main/landing-page");
  return { success: true };
}
