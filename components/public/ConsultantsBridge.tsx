import Link from "next/link";
import { Users, Store, ArrowRight, Phone } from "lucide-react";
import PublicThemeToggle from "@/components/PublicThemeToggle";
import { createClient } from "@/lib/supabase/server";
import PublicRecessTimer from "@/components/public/PublicRecessTimer";

export default async function ConsultantsBridge({
  profile,
  orgName,
  orgLogo,
  orgSlug,
  accentColor,
  secondaryColor,
  reason
}: {
  profile: any;
  orgName: string | null;
  orgLogo: string | null;
  orgSlug: string;
  accentColor: string;
  secondaryColor: string;
  reason: 'terminated' | 'paused' | 'unavailable';
}) {
  const supabase = await createClient();

  // Buscar 3 a 4 vendedores ativos da mesma empresa
  const { data: activeSellers } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, slug, whatsapp")
    .eq("organization_id", profile.organization_id)
    .eq("status", "active")
    .eq("role", "seller") // Exclude admin, only show sellers
    .neq("id", profile.id || "") // Exclui o próprio consultor da lista de alternativos
    .limit(4);

  const isTerminated = reason === 'terminated';
  const isUnavailable = reason === 'unavailable';

  const title = isTerminated 
    ? "Consultor Indisponível" 
    : isUnavailable 
      ? "Catálogo Indisponível" 
      : "Consultor Ausente";
  
  const description = isTerminated 
    ? `Este consultor não atende mais por este link. Mas não se preocupe, a equipe de vendas continua pronta para te atender!`
    : isUnavailable
      ? profile?.full_name 
        ? `O catálogo do consultor ${profile.full_name} está temporariamente indisponível. Mas você ainda pode falar com ele diretamente pelo WhatsApp ou falar com outro consultor da equipe.`
        : `Este catálogo está temporariamente indisponível. Mas você ainda pode falar com a equipe de vendas.`
      : `O consultor ${profile.full_name || ''} está temporariamente ausente. Mas não se preocupe, a equipe continua pronta para te atender!`;

  return (
    <>
      <PublicThemeToggle />
      <main
        className="public-theme-container flex flex-col items-center justify-center min-h-[100dvh] px-4 py-10 overflow-hidden relative"
      >
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

        <div className="public-card w-full max-w-md relative z-10 rounded-[32px] overflow-hidden backdrop-blur-2xl">
          <div
            style={{
              height: 4,
              background: `linear-gradient(90deg, transparent 0%, ${accentColor} 40%, ${secondaryColor} 60%, transparent 100%)`,
            }}
          />
          
          <div className="p-8">
            {orgLogo && (
              <div className="mb-8 flex justify-center opacity-80">
                <img src={orgLogo} alt={orgName || "Logo"} className="h-10 w-auto object-contain" />
              </div>
            )}

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 mb-4 ring-4 ring-zinc-50 dark:ring-zinc-900">
                <Users size={28} />
              </div>
              <h1 className="text-xl font-bold text-[var(--public-text-main)] mb-2">
                {title}
              </h1>
              <p className="text-sm text-[var(--public-text-dim)] leading-relaxed mb-6">
                {description}
              </p>
              {profile.recess_ends_at && new Date(profile.recess_ends_at) > new Date() && (
                <PublicRecessTimer endsAt={profile.recess_ends_at} />
              )}
            </div>

            {isUnavailable && profile?.whatsapp && profile?.full_name && (
              <div className="mb-8">
                <Link
                  href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  className="flex items-center justify-center gap-3 w-full py-4 px-5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: accentColor, boxShadow: `0 8px 20px -8px ${accentColor}` }}
                >
                  <Phone size={18} />
                  Falar com {profile.full_name.split(" ")[0]} no WhatsApp
                </Link>
              </div>
            )}

            {activeSellers && activeSellers.length > 0 && (
              <div className="mb-8 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--public-text-muted)] text-center mb-4">
                  Fale com outro consultor
                </p>
                {activeSellers.map((seller, idx) => (
                  <Link 
                    key={idx}
                    href={`/${seller.slug}`}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] hover:bg-[rgba(255,255,255,0.05)] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.full_name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                          {seller.full_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--public-text-main)] truncate group-hover:text-[var(--public-text-main)] transition-colors">
                        {seller.full_name}
                      </p>
                      <p className="text-xs text-[var(--public-text-muted)] truncate flex items-center gap-1">
                        <Phone size={10} /> Chamar no WhatsApp
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-zinc-400 group-hover:text-[var(--public-text-main)] group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-[var(--public-card-border)]">
              <Link
                href={`/${orgSlug}/vendedores`}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: accentColor, boxShadow: `0 8px 20px -8px ${accentColor}` }}
              >
                <Users size={18} />
                Ver Consultores Disponíveis
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
