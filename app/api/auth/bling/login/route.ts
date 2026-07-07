import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.redirect(new URL("/dashboard/empresa?bling_error=org_id_missing", request.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  const clientId = process.env.BLING_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/dashboard/empresa?bling_error=client_id_missing", request.url));
  }

  const state = orgId; // Passamos o orgId no state para recuperarmos no callback
  const blingAuthUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&state=${state}`;

  return NextResponse.redirect(blingAuthUrl);
}
