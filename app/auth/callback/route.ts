import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Erro ao trocar code por sessão:", error.message);
    return NextResponse.redirect(`${origin}/entrar`);
  }

  const session = data.session;
  if (!session?.user) {
    return NextResponse.redirect(`${origin}/entrar`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("slug")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao buscar perfil:", profileError.message);
    return NextResponse.redirect(`${origin}/entrar`);
  }

  if (!profile?.slug) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}