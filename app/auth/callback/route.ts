import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    console.warn("Callback chamado sem código.");
    return NextResponse.redirect(`${requestUrl.origin}/entrar`);
  }

  const cookieStore = await cookies();

  // Prepara resposta com redirecionamento padrão para permitir gravação de cookies de sessão no browser
  const redirectUrl = new URL(`${requestUrl.origin}${next}`);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          } catch {
            // Ignora se invocado em contexto somente-leitura
          }
        },
      },
    }
  );

  console.log("Iniciando troca de código por sessão no callback...");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Erro na troca de código:", error.message);
    const errParam = encodeURIComponent(error.message || "auth_callback_failed");
    return NextResponse.redirect(`${requestUrl.origin}/entrar?error=${errParam}`);
  }

  const user = data.user;
  if (!user) {
    console.error("Nenhum usuário retornado após troca de código.");
    return NextResponse.redirect(`${requestUrl.origin}/entrar?error=no_user`);
  }

  console.log("Sessão obtida com sucesso. Usuário:", user.id, user.email);

  // Busca perfil por id ou por user_id para garantir compatibilidade total
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, slug, organization_id, user_id, email, avatar_url, organizations(slug)")
    .or(`id.eq.${user.id},user_id.eq.${user.id}`)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao buscar perfil no callback:", profileError.message);
  }

  if (profile) {
    // Sincroniza atômica de user_id, email e avatar se ainda não preenchidos
    const updates: Record<string, any> = {};
    if (!profile.user_id) updates.user_id = user.id;
    if (!profile.email && user.email) updates.email = user.email;
    const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (!profile.avatar_url && metaAvatar) updates.avatar_url = metaAvatar;

    if (Object.keys(updates).length > 0) {
      await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);
    }

    const orgSlug = (profile.organizations as any)?.slug || profile.slug || "majmobilidade";
    const destination = next.startsWith("/dashboard") ? `/${orgSlug}${next}` : next;

    console.log("Perfil encontrado. Redirecionando para:", destination);
    const finalUrl = new URL(`${requestUrl.origin}${destination}`);
    const finalResponse = NextResponse.redirect(finalUrl);

    // Copia os cookies gravados anteriormente
    response.cookies.getAll().forEach((c) => {
      finalResponse.cookies.set(c.name, c.value, c);
    });

    return finalResponse;
  }

  // Se não encontrar perfil prévio, redireciona para onboarding
  console.log("Perfil não encontrado, redirecionando para onboarding.");
  return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
}