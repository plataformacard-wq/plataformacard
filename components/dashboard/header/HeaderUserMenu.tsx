"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User, LogOut } from "lucide-react";
import Link from "next/link";
import { getAccessStatusName, getAccessStatusColor } from "@/lib/utils/permissions";

interface HeaderUserMenuProps {
  nome: string;
  avatar: string | null;
  role: string;
  globalIconUrl?: string | null;
  businessModel?: "B2B" | "B2C" | "CaaS" | "ALL_SERVICE";
  jobTitle?: string | null;
  granularPermissions?: any;
  handleLogout: () => void;
}

export function HeaderUserMenu({
  nome,
  avatar,
  role,
  globalIconUrl,
  businessModel,
  jobTitle,
  granularPermissions,
  handleLogout
}: HeaderUserMenuProps) {
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
    <div ref={userMenuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsUserMenuOpen((prev) => !prev)}
        className="flex items-center gap-2 sm:gap-3 rounded-lg p-1 pr-2 transition-all hover:bg-[var(--dash-hover-bg)]"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={nome}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain"
          />
        ) : (role === "main_admin" && globalIconUrl) ? (
          <img
            src={globalIconUrl}
            alt={nome}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain p-1"
          />
        ) : (
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-white text-xs sm:text-sm font-bold shadow-sm">
            {nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-semibold leading-none text-[var(--dash-text-primary)]">
            {role === "main_admin" ? "Gestor Global" : nome}
          </span>
          <span className="text-[10px] text-[var(--dash-text-muted)] font-medium capitalize mt-1 leading-none">
            {role === "main_admin" ? "MAIN Admin" : 
             businessModel === "CaaS" ? "Gestor de Catálogo" :
             role === "b2b_admin" ? "Gestor Empresarial" : 
             role === "b2c_admin" ? "Gestor Individual" : 
             role === "caas_admin" ? "Gestor de Catálogo" : 
             role === "seller" ? (jobTitle || "Vendedor") : role}
          </span>
          {role === 'seller' && (
            <span className={`mt-1.5 inline-flex items-center rounded px-1.5 py-[2px] text-[9px] font-black uppercase tracking-widest border ${getAccessStatusColor(getAccessStatusName(granularPermissions))}`}>
              {getAccessStatusName(granularPermissions)}
            </span>
          )}
        </div>
        <ChevronDown size={14} className={`text-[var(--dash-text-muted)] transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-[27px] p-2 shadow-2xl overflow-hidden z-[100] border border-[var(--dash-border)] bg-[var(--dash-surface)]"
          >
            <div className="px-3 py-2 mb-1 border-b border-[var(--dash-border)]/50 pb-3">
              <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Conta</p>
              <p className="text-xs font-medium text-[var(--dash-text-primary)] mt-0.5 truncate">
                {role === "main_admin" ? "Gestor Global" : nome}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Link
                href="/dashboard/perfil#perfil"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--dash-text-secondary)] transition-all hover:bg-[var(--dash-hover-bg)] hover:text-primary"
              >
                <User size={16} />
                Meu Perfil
              </Link>
            </div>
            <div
              role="button"
              onClick={() => {
                console.log("Logout clicado!");
                handleLogout();
              }}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={16} />
              Sair
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
