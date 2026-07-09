import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json();

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId missing" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("organizations")
      .update({ 
        bling_access_token: null,
        bling_refresh_token: null,
        bling_token_expires_at: null
      })
      .eq("id", orgId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao desconectar Bling:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
