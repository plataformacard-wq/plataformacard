import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    console.warn("Callback chamado sem código.");
    return NextResponse.redirect(`${requestUrl.origin}/entrar`);
  }

  const supabase = await createClient();

  console.log("Iniciando troca de código por sessão...");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Erro na troca de código:", error.message);
    return NextResponse.redirect(`${requestUrl.origin}/entrar?error=auth_callback_failed`);
  }

  const user = data.user;
  if (!user) {
    console.error("Nenhum usuário retornado após troca de código.");
    return NextResponse.redirect(`${requestUrl.origin}/entrar?error=no_user`);
  }

  console.log("Sessão obtida. Verificando perfil para o usuário:", user.id);

  // Verifica se o perfil existe e tem slug
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao buscar perfil no callback:", profileError.message);
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  }

  if (!profile?.slug) {
    console.log("Usuário sem slug, redirecionando para onboarding.");
    return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
  }

  console.log("Fluxo de callback concluído com sucesso. Indo para:", next);
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}