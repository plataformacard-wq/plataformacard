import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se as variáveis de ambiente do Supabase não estiverem prontas, prossegue normalmente
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  
  if (error && error.message.includes("Refresh Token")) {
    console.warn("Token de refresh inválido detectado no middleware. Limpando cookies e redirecionando.");
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/entrar";
    
    const cleanResponse = NextResponse.redirect(redirectUrl);
    
    // Remove os cookies de autenticação do Supabase para evitar loops
    const supabaseCookies = request.cookies.getAll().filter(c => c.name.startsWith("sb-"));
    supabaseCookies.forEach(c => {
      cleanResponse.cookies.delete(c.name);
    });
    
    return cleanResponse;
  }

  // Proteção de rotas para Dashboard e Admin Principal
  if (!user && (path.startsWith("/dashboard") || (path.startsWith("/main") && !path.startsWith("/main-login")) || path.startsWith("/admin") || path.startsWith("/onboarding"))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/entrar";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
