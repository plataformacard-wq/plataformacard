import Link from 'next/link';
import { ThemeToggle } from '@/components/landing-page/ThemeToggle';

export function Header({ settings }: { settings?: any }) {
  const logoDark = settings?.logo_url_dark || "/logo_fundo_escuro_ps.png";
  const logoLight = settings?.logo_url_light || settings?.logo_url_dark || "/logo_fundo_escuro_ps.png";
  const isDefaultLightLogo = !settings?.logo_url_light && !settings?.logo_url_dark;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md dark:bg-[#0a0a0a]/80 bg-white/80 border-b dark:border-white/10 border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* Logo Tema Escuro */}
          <img 
            src={logoDark} 
            alt="Logo PlataformaShop" 
            className="h-10 md:h-12 object-contain dark:block hidden" 
          />
          {/* Logo Tema Claro */}
          <img 
            src={logoLight} 
            alt="Logo PlataformaShop" 
            className={`h-10 md:h-12 object-contain dark:hidden block ${isDefaultLightLogo ? "invert brightness-0" : ""}`} 
          />
        </Link>
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="#como-funciona" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Como Funciona</Link>
          <Link href="#recursos" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Recursos</Link>
          <Link href="#planos" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Planos</Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <Link 
            href="/entrar" 
            className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </header>
  );
}
