import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import PublicThemeToggle from "@/components/PublicThemeToggle";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function VendedoresPublicPage(props: PageProps) {
  const { slug } = await props.params;
  const admin = createAdminClient();

  // 1. Buscar a organização pelo slug
  const { data: org } = await admin
    .from("organizations")
    .select("id, name, slug, logo_url, favicon_url, accent_color, secondary_color")
    .ilike("slug", slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  // 2. Buscar todos os vendedores da empresa
  const { data: profilesData } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, slug, bio, whatsapp, is_available, status, role, recess_ends_at")
    .eq("organization_id", org.id)
    .eq("role", "seller")
    .order("full_name");

  const sellers = (profilesData || []).filter(seller => {
    const isRecessActive = seller.recess_ends_at && new Date(seller.recess_ends_at) > new Date();
    if (isRecessActive) return false;
    return seller.status === "active" && seller.is_available === true;
  });

  const accentColor = org.accent_color || "#25D366";
  const secondaryColor = org.secondary_color || "#128C7E";
  const orgLogo = org.logo_url ?? null;
  const orgFavicon = org.favicon_url ?? null;
  const orgName = org.name ?? "Nossa Equipe";

  return (
    <>
      <PublicThemeToggle />
      <main className="public-theme-container flex flex-col items-center justify-center min-h-[100dvh] px-4 py-10 overflow-hidden relative">
        {/* Mesh Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full opacity-20"
            style={{ background: accentColor }}
          />
          <div 
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[100px] rounded-full opacity-10"
            style={{ background: secondaryColor }}
          />
        </div>

        {/* Style scoped to make cards pop */}
        <style dangerouslySetInnerHTML={{ __html: `
          .public-card {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .public-card:hover {
            transform: translateY(-2px);
          }
        `}} />

        <div className="public-card w-full max-w-md relative z-10 rounded-[32px] overflow-hidden backdrop-blur-2xl">
          {/* Header Accent Bar */}
          <div
            style={{
              height: 4,
              background: `linear-gradient(90deg, transparent 0%, ${accentColor} 40%, ${secondaryColor} 60%, transparent 100%)`,
            }}
          />

          <div className="p-8">
            {/* Logo da Empresa */}
            {orgLogo && (
              <div className="mb-6 flex justify-center opacity-80">
                <img src={orgLogo} alt={orgName} className="h-10 w-auto object-contain" />
              </div>
            )}

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 mb-4 ring-4 ring-zinc-50 dark:ring-zinc-900">
                <Users size={24} className="text-primary" style={{ color: accentColor }} />
              </div>
              <h1 className="text-xl font-bold text-[var(--public-text-main)] mb-1">
                Consultores Disponíveis
              </h1>
              <p className="text-xs text-[var(--public-text-dim)]">
                Escolha um de nossos vendedores ativos para iniciar o seu atendimento imediato.
              </p>
            </div>

            {/* Listagem de Vendedores */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {sellers && sellers.length > 0 ? (
                sellers.map((seller) => (
                  <Link 
                    key={seller.id}
                    href={`/${seller.slug}`}
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] hover:bg-[rgba(255,255,255,0.05)] transition-all group"
                  >
                    {/* Avatar do Vendedor ou Favicon Fallback */}
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 border-2 border-[var(--public-card-border)] flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.full_name || ""} className="w-full h-full object-cover" />
                      ) : orgFavicon ? (
                        <img src={orgFavicon} alt={orgName} className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-400">
                          {seller.full_name?.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--public-text-main)] truncate group-hover:text-[var(--public-text-main)] transition-colors">
                        {seller.full_name}
                      </p>
                      <p className="text-xs text-[var(--public-text-dim)] truncate">
                        {seller.bio || "Consultor de Vendas"}
                      </p>
                    </div>

                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" style={{ color: accentColor }} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-[var(--public-text-muted)]">
                  <p className="text-sm font-bold">Nenhum consultor disponível no momento.</p>
                  <p className="text-xs mt-1">Por favor, retorne em nosso horário comercial.</p>
                </div>
              )}
            </div>

            {/* Acesso ao Catálogo da Loja como Link de Retorno */}
            <div className="pt-6 mt-6 border-t border-[var(--public-card-border)] text-center">
              <Link 
                href={`/${org.slug}/catalogo`}
                className="inline-flex items-center gap-2 text-xs font-bold text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] transition-colors"
              >
                <ArrowLeft size={14} /> Acessar catálogo geral da empresa
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-8 flex items-center gap-2 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
          <span className="text-[10px] tracking-wider text-[var(--public-text-muted)]">anotameucontato.com.br</span>
        </footer>
      </main>
    </>
  );
}
