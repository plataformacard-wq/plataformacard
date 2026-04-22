"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  User,
  UserCircle,
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
  X,
  ChevronDown,
  Clock,
  Info
} from "lucide-react";

interface SidebarProps {
  role: "superadmin" | "b2b_admin" | "b2c_admin" | "seller" | "admin" | string;
  businessModel: "B2B" | "B2C";
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, businessModel, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const handleHash = () => setCurrentHash(window.location.hash.replace("#", ""));
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  const [openMenus, setOpenMenus] = useState<string[]>([]); // Começa fechado conforme solicitado

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
  ];

  if (role === "superadmin") {
    navLinks.push({ href: "/admin", label: "Painel QG", icon: Settings });
  }

  // Se for Gestor B2B (admin), b2b_admin ou SuperAdmin, mostra tudo
  if (role === "admin" || role === "b2b_admin" || role === "superadmin") {
    navLinks.push({ 
      label: "Empresa", 
      icon: Building2,
      subItems: [
        { href: "/dashboard/empresa", label: "Horário de Funcionamento", icon: Clock },
      ]
    } as any);
    navLinks.push({ 
      label: "Catálogo", 
      icon: BookOpen,
      subItems: [
        { href: "/dashboard/catalogo", label: "Gerenciar Produtos", icon: BookOpen },
        { href: "/dashboard/catalogo/bulk", label: "Cadastro em Massa", icon: LayoutDashboard },
      ]
    } as any);

    // No modelo B2C, não há gestão de vendedores
    // Esconde se for explicitamente B2C ou se a role for b2c_admin
    const isB2C = businessModel === "B2C" || (role as any) === "b2c_admin";
    
    if (!isB2C) {
      navLinks.push({ href: "/dashboard/vendedores", label: "Vendedores", icon: Users });
    } else {
      // Para B2C, o "Vendedor" é ele mesmo, então chamamos de Editar Cartão Público
      navLinks.push({ href: "/dashboard/perfil#cartao", label: "Editar Cartão Público", icon: UserCircle });
    }
  }

  navLinks.push({ href: "/dashboard/perfil#perfil", label: "Perfil", icon: ShieldCheck });
  navLinks.push({ href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 });

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-[var(--dash-bg)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-10 flex items-center justify-between px-2">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight leading-none text-[var(--dash-text-primary)]">PlataformaCard</span>
                <span className="text-[10px] text-[var(--dash-text-muted)] font-medium uppercase tracking-wider">
                  {businessModel === "B2B" ? "Painel de gestão empresarial" : "Painel Gestor"}
                </span>
              </div>
            </Link>
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--dash-hover-bg)] lg:hidden">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {navLinks.map((item: any) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isMenuOpen = openMenus.includes(item.label);
              const itemHash = item.href?.includes("#") ? item.href.split("#")[1] : null;
              const isSamePath = pathname === item.href?.split("#")[0];
              const isSameHash = itemHash ? currentHash === itemHash : !currentHash;
              
              const isActive = (isSamePath && isSameHash) || (hasSubItems && item.subItems.some((s: any) => pathname === s.href));

              if (hasSubItems) {
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`group relative flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive 
                          ? "text-primary bg-primary/5" 
                          : "text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-[var(--dash-text-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isActive && (
                          <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
                        )}
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden pl-10 space-y-1"
                        >
                          {item.subItems.map((sub: any) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => { 
                                  if (window.innerWidth < 1024) onClose(); 
                                }}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                  isSubActive 
                                    ? "text-primary bg-primary/5" 
                                    : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)]"
                                }`}
                              >
                                {sub.icon && <sub.icon size={14} />}
                                {sub.label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { 
                    if (window.innerWidth < 1024) onClose();
                    // Forçar atualização do hash para o indicador reagir na hora
                    if (item.href.includes("#")) {
                      setCurrentHash(item.href.split("#")[1]);
                    } else {
                      setCurrentHash("");
                    }
                  }}
                  className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-[var(--dash-text-primary)]"
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                  
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                      <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-primary/5 to-transparent p-4 border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Status do Sistema</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-[var(--dash-text-secondary)]">Operacional</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
