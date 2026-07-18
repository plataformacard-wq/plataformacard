import Link from "next/link";

export function Footer({ settings }: { settings?: any }) {
  const socials = settings || {};
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 text-sm">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Coluna 1: Logo e Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              <img src="/logo_fundo_escuro_ps.png" alt="Logo PlataformaShop" className="h-8 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-zinc-500 mb-8 max-w-sm leading-relaxed">
              Potencialize Suas Vendas B2B. A plataforma definitiva para criar vitrines digitais, abandonar PDFs pesados e fechar negócios em tempo real no WhatsApp.
            </p>
            
            <div className="flex gap-4 mb-8">
              {socials.social_instagram && (
                <Link href={socials.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#E1306C] hover:text-white transition-all border border-white/5 hover:border-[#E1306C]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </Link>
              )}
              {socials.social_facebook && (
                <Link href={socials.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#1877F2] hover:text-white transition-all border border-white/5 hover:border-[#1877F2]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </Link>
              )}
              {socials.social_linkedin && (
                <Link href={socials.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#0A66C2] hover:text-white transition-all border border-white/5 hover:border-[#0A66C2]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </Link>
              )}
              {socials.social_youtube && (
                <Link href={socials.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#FF0000] hover:text-white transition-all border border-white/5 hover:border-[#FF0000]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </Link>
              )}
              {socials.social_tiktok && (
                <Link href={socials.social_tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#00f2fe] hover:text-white transition-all border border-white/5 hover:border-[#00f2fe]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </Link>
              )}
              {socials.social_x && (
                <Link href={socials.social_x} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black transition-all border border-white/5 hover:border-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                </Link>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">Recomendado Por</p>
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-4 py-2 w-max cursor-default">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 leading-none">Avaliação 5 Estrelas no</span>
                  <span className="text-xs text-white font-bold leading-tight">Google Meu Negócio</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Produto */}
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Produto</h4>
            <ul className="flex flex-col gap-4 text-zinc-400">
              <li><Link href="#recursos" className="hover:text-[#2CCB68] transition-colors">Recursos</Link></li>
              <li><Link href="#planos" className="hover:text-[#2CCB68] transition-colors">Preços</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Integração WhatsApp</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Cartões NFC</Link></li>
              <li><Link href="#faq" className="hover:text-[#2CCB68] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Soluções */}
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Soluções</h4>
            <ul className="flex flex-col gap-4 text-zinc-400">
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Atacadistas</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Distribuidores</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Representantes</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Franquias</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Fábricas</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Recursos */}
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Recursos</h4>
            <ul className="flex flex-col gap-4 text-zinc-400">
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Guia do Catálogo</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Digital vs PDF</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Estudos de Caso</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Blog B2B</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Glossário de Vendas</Link></li>
            </ul>
          </div>

          {/* Coluna 5: Empresa & Legal */}
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Empresa</h4>
            <ul className="flex flex-col gap-4 text-zinc-400 mb-8">
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Sobre Nós</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Contato</Link></li>
              <li><Link href="#" className="hover:text-[#2CCB68] transition-colors">Parceiros</Link></li>
            </ul>
            
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Legal</h4>
            <ul className="flex flex-col gap-4 text-zinc-400">
              <li><Link href="#" className="hover:text-zinc-300 transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition-colors">Política de Privacidade</Link></li>
              <li><Link href="#" className="hover:text-zinc-300 transition-colors">Cookies</Link></li>
            </ul>
          </div>

        </div>

        {/* Barra Inferior */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
          <p>© {new Date().getFullYear()} PlataformaShop. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistemas operacionais normais
          </div>
        </div>

      </div>
    </footer>
  );
}
