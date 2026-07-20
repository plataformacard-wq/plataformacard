import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // organization_id
  const error = searchParams.get("error");

  // A URL de redirecionamento para voltar pro painel
  const redirectUrl = new URL("/dashboard/estoque", request.url);

  if (error) {
    redirectUrl.searchParams.set("bling_error", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    redirectUrl.searchParams.set("bling_error", "Parâmetros inválidos");
    return NextResponse.redirect(redirectUrl);
  }

  // Verifica se o usuário está logado
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  try {
    const clientId = process.env.BLING_CLIENT_ID;
    const clientSecret = process.env.BLING_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Credenciais do Bling não configuradas no servidor.");
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.json();
      console.error("Bling OAuth Error:", err);
      throw new Error(err.error_description || "Falha ao obter token do Bling");
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calcula quando o token vai expirar
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    // Salva no Supabase na organização correta (que veio no state)
    // Usamos admin client pois a RLS pode bloquear UPDATE na organizations dependendo da role
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    const { error: dbError } = await adminSupabase
      .from("organizations")
      .update({
        bling_access_token: access_token,
        bling_refresh_token: refresh_token,
        bling_token_expires_at: expiresAt.toISOString(),
      })
      .eq("id", state);

    if (dbError) {
      console.error("Erro ao salvar token na DB:", dbError);
      throw dbError;
    }

    redirectUrl.searchParams.set("bling_success", "1");
    return NextResponse.redirect(redirectUrl);

  } catch (err: any) {
    console.error("Bling Integration Error:", err);
    redirectUrl.searchParams.set("bling_error", "Falha na integração");
    return NextResponse.redirect(redirectUrl);
  }
}
