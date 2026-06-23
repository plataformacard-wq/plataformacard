"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackLeadAction({
  organizationId,
  profileId,
  productName,
  sellerName
}: {
  organizationId?: string | null;
  profileId: string;
  productName: string;
  sellerName: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("leads_tracking").insert({
      organization_id: organizationId || null,
      profile_id: profileId,
      product_name: productName,
      seller_name: sellerName
    });

    if (error) {
      console.error("❌ Lead Tracking Action Error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error("🔥 Lead Tracking Action Catch:", err);
    return { success: false, error: String(err) };
  }
}
