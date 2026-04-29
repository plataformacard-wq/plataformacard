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
  businessModel: "B2B" | "B2C" | "CaaS";
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isShadowMode?: boolean;
}

export function Sidebar({ role, businessModel, isOpen, onClose, isCollapsed, setIsCollapsed, isShadowMode }: SidebarProps) {
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

  let navLinks: any[] = [];

  if (role === "superadmin" && !isShadowMode) {
    // Menu exclusivo do Super Admin (QG)
    navLinks = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/catalogos", label: "Análise de Catálogos", icon: BookOpen },
      { href: "/admin/cartoes", label: "Cartões Públicos", icon: UserCircle },
      { href: "/admin/analytics", label: "Analytics Global", icon: BarChart3 },
      { href: "/admin/settings", label: "Admin Settings", icon: ShieldCheck },
    ];
  } else {
    // Menu padrão para outros usuários (B2B/B2C)
    navLinks = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
    ];

    if (role === "admin" || role === "b2b_admin") {
      const isB2B = businessModel === "B2B";

      navLinks.push({ 
        label: "Empresa", 
        icon: Building2,
        subItems: [
          ...(!isB2B ? [{ href: "/dashboard/empresa", label: "Horário de Funcionamento", icon: Clock }] : []),
          { href: "/dashboard/empresa/seo", label: "Informações e SEO", icon: Settings },
        ]
      } as any);
      navLinks.push({ 
        label: "Catálogo", 
        icon: BookOpen,
        subItems: [
          { href: "/dashboard/catalogo", label: "Gerenciar Produtos", icon: BookOpen },
          { href: "/dashboard/catalogo/bulk", label: "Gerenciar produtos em Massa", icon: LayoutDashboard },
          { href: "/dashboard/catalogo/configuracoes", label: "Configurações", icon: Settings },
        ]
      } as any);

      const isB2C = businessModel === "B2C" || (role as any) === "b2c_admin";
      const isCaaS = businessModel === "CaaS" || (role as any) === "caas_admin";
      
      if (!isB2C && !isCaaS) {
        navLinks.push({ href: "/dashboard/vendedores", label: "Vendedores", icon: Users });
      }
      
      if (isB2C) {
        navLinks.push({ href: "/dashboard/perfil#cartao", label: "Editar Cartão Público", icon: UserCircle });
      }
    }

    navLinks.push({ href: "/dashboard/perfil#perfil", label: "Perfil", icon: ShieldCheck });
    navLinks.push({ href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 });
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transform border-r transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isCollapsed ? "w-20" : "w-72"
        }`}
        style={{ backgroundColor: "#1e1e1e", borderColor: "#2c3338" }}
      >
        <div className="flex h-full flex-col py-6 relative">
          {/* Collapse Toggle Button (Desktop) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-12 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md border border-[var(--dash-surface)] z-50 hover:scale-110 transition-transform"
          >
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-90"}`} 
            />
          </button>

          {/* Logo Area */}
          <div className={`mb-10 flex items-center px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden whitespace-nowrap transition-all">
                  <span className="text-base font-bold tracking-tight leading-none text-white">PlataformaCard</span>
                  <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider">
                    {isShadowMode ? "Modo Simulação" : (role === "superadmin" ? "Centro de Inteligência" : (businessModel === "B2B" ? "Painel empresarial" : "Painel Gestor"))}
                  </span>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button onClick={onClose} className="rounded-lg p-1 text-[#a7aaad] hover:bg-[#2c3338] lg:hidden">
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                      className={`group relative flex w-full items-center justify-between rounded-xl p-3 text-sm font-medium transition-all ${
                        isActive 
                          ? "text-white bg-primary" 
                          : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-white"
                      } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                      title={isCollapsed ? item.label : ""}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
                        />
                      )}
                      {isCollapsed && hasSubItems && (
                        <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 opacity-30">
                          <ChevronDown 
                            size={14} 
                            className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
                          />
                        </div>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className={`overflow-hidden space-y-1 ${isCollapsed ? "px-0 flex flex-col items-center" : "pl-10"}`}
                        >
                          {item.subItems.map((sub: any) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={`flex items-center gap-2 rounded-lg transition-all ${
                                  isCollapsed ? "p-2 justify-center" : "px-3 py-2 text-xs"
                                } ${
                                  isSubActive 
                                    ? "text-white font-bold" 
                                    : "text-[#a7aaad] hover:text-white"
                                }`}
                                title={isCollapsed ? sub.label : ""}
                              >
                                {sub.icon && <sub.icon size={isCollapsed ? 18 : 14} />}
                                {!isCollapsed && sub.label}
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
                  className={`group relative flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all ${
                    isActive 
                      ? "text-white bg-primary" 
                      : "text-[#a7aaad] hover:bg-[#2c3338] hover:text-white"
                  } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && <span>{item.label}</span>}
                  
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 h-6 w-1 rounded-r-full bg-white/50" />
                  )}
                </Link>
              );
            })}
          </nav>

          {!isCollapsed && (
            <div className="mt-auto px-4 pb-6">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Status do Sistema</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-[#a7aaad]">Operacional</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
