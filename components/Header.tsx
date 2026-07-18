import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-[#0a0a0a]/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo_fundo_escuro_ps.png" alt="Logo PlataformaShop" className="h-10 md:h-12 object-contain" />
        </Link>
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-zinc-400">
          <Link href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link>
          <Link href="#recursos" className="hover:text-white transition-colors">Recursos</Link>
          <Link href="#planos" className="hover:text-white transition-colors">Planos</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/entrar" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors hidden sm:block">
            Fazer Login
          </Link>
          <button className="px-5 py-2.5 rounded-xl bg-[#2CCB68] text-white text-sm font-semibold shadow-[0_0_20px_rgba(44,203,104,0.15)] hover:bg-[#23994A] transition-colors transform hover:-translate-y-0.5">
            Comprar Cartão
          </button>
        </div>
      </div>
    </header>
  );
}
