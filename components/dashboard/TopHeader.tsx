"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  LogOut,
  Menu,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface TopHeaderProps {
  nome: string;
  avatar: string | null;
  role: string;
  isDark: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
  onMenuClick: () => void;
  slug?: string | null;
}

export function TopHeader({ 
  nome, 
  avatar, 
  role, 
  isDark, 
  toggleTheme, 
  handleLogout,
  onMenuClick,
  slug
}: TopHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b bg-[var(--dash-bg)]/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-[var(--dash-hover-bg)] lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Buscar recursos..." 
            className="h-10 w-64 rounded-xl border bg-[var(--dash-input-bg)] pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative rounded-xl p-2.5 text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-primary transition-all">
          <Bell size={20} />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-primary transition-all"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-8 w-[1px] bg-[var(--dash-border)] mx-1" />

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl p-1 pr-2 transition-all hover:bg-[var(--dash-hover-bg)]"
          >
            {avatar ? (
              <img
                src={avatar}
                alt={nome}
                className="h-9 w-9 rounded-lg border border-[var(--dash-border)] object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold shadow-sm">
                {nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-semibold leading-none text-[var(--dash-text-primary)]">{nome}</span>
              <span className="text-[10px] text-[var(--dash-text-muted)] font-medium capitalize mt-1">
                {role === "superadmin" ? "Admin QG" : 
                 role === "b2b_admin" ? "Gestor" : 
                 role === "b2c_admin" ? "Gestor" : 
                 role === "seller" ? "Vendedor" : role}
              </span>
            </div>
            <ChevronDown size={14} className={`text-[var(--dash-text-muted)] transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl p-2 shadow-2xl overflow-hidden z-[100] border border-[var(--dash-border)] bg-[var(--dash-surface)]"
              >
                <div className="px-3 py-2 mb-1 border-b border-[var(--dash-border)]/50 pb-3">
                  <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Conta</p>
                  <p className="text-xs font-medium text-[var(--dash-text-primary)] mt-0.5 truncate">{nome}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {slug && (
                    <Link
                      href={`/${slug}`}
                      target="_blank"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-sm font-bold text-emerald-500 transition-all hover:bg-emerald-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <ExternalLink size={16} />
                        Meu Cartão Digital
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/dashboard/perfil"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--dash-text-secondary)] transition-all hover:bg-[var(--dash-hover-bg)] hover:text-primary"
                  >
                    <User size={16} />
                    Meu Perfil
                  </Link>
                </div>
                <div
                  role="button"
                  onClick={(e) => {
                    console.log("Logout clicado!");
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut size={16} />
                  Sair
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
