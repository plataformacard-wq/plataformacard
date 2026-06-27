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

  // Lógica de Domínios Customizados
  const hostname = request.headers.get("host") || "";
  const isLocalhost = hostname.includes("localhost");
  const isVercel = hostname.includes("vercel.app");
  const isMainDomain = hostname.includes("anotameucontato") || hostname.includes("plataformacard");

  if (!isLocalhost && !isVercel && !isMainDomain) {
    // É um domínio customizado, vamos buscar a org no banco
    const { data: org } = await supabase
      .from("organizations")
      .select("id, slug")
      .eq("custom_domain", hostname)
      .maybeSingle();

    if (org && org.slug) {
      const url = request.nextUrl.clone();
      
      if (url.pathname === "/" || url.pathname.startsWith("/catalogo")) {
        // Acesso à empresa principal
        url.pathname = `/${org.slug}${url.pathname === "/" ? "" : url.pathname}`;
      } else {
        // Acesso a um vendedor (ex: /joao ou /joao/catalogo)
        const vendorSlug = url.pathname.split("/")[1];
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("slug", vendorSlug)
          .eq("organization_id", org.id)
          .maybeSingle();
          
        if (!profile) {
          return new NextResponse("Not Found", { status: 404 });
        }
        
        // A URL já está no formato /vendorSlug, deixamos assim pois app/[slug] lida com isso.
      }
      
      return NextResponse.rewrite(url);
    }
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
