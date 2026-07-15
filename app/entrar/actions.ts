"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveSlugToEmail(slug: string) {
  try {
    const adminClient = createAdminClient();
    
    // Find the profile with this slug
    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("organization_id, role")
      .eq("slug", slug.toLowerCase())
      .single();

    if (error || !profile) {
      return { error: "Vendedor não encontrado com este slug." };
    }

    if (profile.role !== "seller") {
      return { error: "Este link não pertence a um vendedor." };
    }

    const orgIdShort = profile.organization_id.split("-")[0];
    const virtualEmail = `vendedor_${slug}_${orgIdShort}@interno.plataforma.card`;

    return { email: virtualEmail };
  } catch (err: any) {
    return { error: err.message };
  }
}
