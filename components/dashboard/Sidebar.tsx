"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlobalBranding } from "@/components/providers/GlobalBrandingProvider";
import { motion, AnimatePresence } from "framer-motion";
import packageJson from "../../package.json";
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
  Info,
  Globe,
  HardDrive,
  BadgeDollarSign,
  CreditCard,
  Sparkles,
  Paintbrush,
  Package,
  Kanban
} from "lucide-react";

interface SidebarProps {
  role: "main_admin" | "b2b_admin" | "b2c_admin" | "seller" | "admin" | string;
  businessModel?: "B2B" | "B2C" | "CaaS" | "ALL_SERVICE";
  planId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isShadowMode?: boolean;
  isReady?: boolean;
  permissions?: {
    dash_access_catalog: boolean;
    dash_access_analytics: boolean;
    dash_access_company: boolean;
  };
  granularPermissions?: any;
}

interface NavLink {
  href?: string;
  label: string;
  icon: React.ElementType;
  subItems?: { href: string; label: string; icon: React.ElementType }[];
}

export function Sidebar({ role, businessModel, planId, isOpen, onClose, isCollapsed, setIsCollapsed, isShadowMode, isReady, permissions, granularPermissions }: SidebarProps) {
  const pathname = usePathname();
  const { globalLogoUrl, globalIconUrl } = useGlobalBranding();
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

  // DETERMINAÇÃO DO MENU (QG vs CLIENTE)
  const isAdminPath = pathname.startsWith("/main");
  let navLinks: NavLink[] = [];
  const isActuallySuperAdmin = role === "main_admin";

  if (isAdminPath && !isShadowMode) {
    // Menu exclusivo do Super Admin (QG) - Centro de Inteligência
    navLinks = [
      { href: "/main", label: "Dashboard (QG)", icon: LayoutDashboard },
      { 
        label: "BI & Analytics", 
        icon: BarChart3,
        subItems: [
          { href: "/main/analytics?tab=b2b", label: "Desempenho B2B", icon: Building2 },
          { href: "/main/analytics?tab=b2c", label: "Métricas B2C", icon: Users },
          { href: "/main/analytics?tab=caas", label: "Gestão CaaS", icon: Globe },
        ]
      },
      { 
        label: "Gestão SaaS", 
        icon: Building2,
        subItems: [
          { href: "/main/assinaturas", label: "Assinaturas & Planos", icon: BadgeDollarSign },
          { href: "/main/clientes", label: "Empresas (Raio-X)", icon: Users },
          { href: "/main/contas", label: "Gestão de Contas (Status)", icon: ShieldCheck },
          { href: "/main/cartoes", label: "Cartões Públicos", icon: UserCircle },
          { href: "/main/caas", label: "Gestão de Catálogos & CaaS", icon: Globe },
          { href: "/main/recursos", label: "Gestão de Recursos", icon: HardDrive },
        ]
      },
      { 
        label: "CMS (Site Externo)", 
        icon: LayoutDashboard,
        subItems: [
          { href: "/main/landing-page", label: "Página Inicial (Home)", icon: LayoutDashboard },
        ]
      },
      { 
        label: "Configurações", 
        icon: ShieldCheck,
        subItems: [
          { href: "/main/ia", label: "Inteligência Artificial", icon: Sparkles },
          { href: "/main/settings", label: "Geral & Planos", icon: Settings },
          { href: "/main/branding", label: "Marca e Cores", icon: Paintbrush },
          { href: "/main/maintenance", label: "Manutenção Global", icon: Info },
        ]
      },
    ];
  } else {
    // Menu padrão para outros usuários (B2B/B2C) ou Admin em modo simulação
    navLinks = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
    ];

    // Atalho para o QG se for Super Admin (Acesso Completo)
    if (isActuallySuperAdmin) {
      navLinks.unshift({ 
        label: "Plataforma QG", 
        icon: ShieldCheck,
        subItems: [
          { href: "/main", label: "Dashboard (QG)", icon: LayoutDashboard },
          { href: "/main/analytics?tab=b2b", label: "BI & Analytics", icon: BarChart3 },
          { href: "/main/assinaturas", label: "Assinaturas & Planos", icon: BadgeDollarSign },
          { href: "/main/clientes", label: "Gestão de Empresas", icon: Users },
          { href: "/main/contas", label: "Contas e Status", icon: ShieldCheck },
          { href: "/main/caas", label: "Gestão de Catálogos & CaaS", icon: Globe },
          { href: "/main/recursos", label: "Gestão de Recursos", icon: HardDrive },
          { href: "/main/landing-page", label: "CMS Landing Page", icon: LayoutDashboard },
          { href: "/main/maintenance", label: "Manutenção Global", icon: Info },
          { href: "/main/settings", label: "Configurações Globais", icon: Settings },
        ]
      });
    }

    if (role === "admin" || role === "b2b_admin" || role === "b2c_admin" || isActuallySuperAdmin) {
      const isB2B = businessModel === "B2B";
      const isAllService = businessModel === "ALL_SERVICE";
      const isCaaS = businessModel === "CaaS" || (role as any) === "caas_admin";
      const isB2C = (businessModel === "B2C" || (role as any) === "b2c_admin") && !isCaaS && role !== "b2b_admin";

      const companySubItems = [];
      const canHours = granularPermissions?.company?.hours !== false;
      const canSeo = granularPermissions?.company?.seo !== false;
      const canDomain = granularPermissions?.company?.domain !== false;
      const canAccess = granularPermissions?.company?.access !== false;

      if (canHours) companySubItems.push({ href: "/dashboard/empresa", label: "Horário de Funcionamento", icon: Clock });
      if (canSeo) companySubItems.push({ href: "/dashboard/empresa/seo", label: "Informações e SEO", icon: Settings });
      if (canDomain) companySubItems.push({ href: isB2C ? "/dashboard/perfil/dominio" : "/dashboard/empresa/dominio", label: "Configurar Domínio", icon: Globe });
      if (canAccess) companySubItems.push({ href: "/dashboard/empresa/acessos", label: "Gerenciar Acessos", icon: ShieldCheck });

      navLinks.push({ 
        label: "Empresa", 
        icon: Building2,
        subItems: companySubItems
      });

      navLinks.push({ 
        label: "Catálogo", 
        icon: BookOpen,
        subItems: [
          { href: "/dashboard/catalogo/gerenciador", label: "Gerenciar Catálogo", icon: BookOpen },
          { href: "/dashboard/catalogo/configuracoes", label: "Configurar Catálogo", icon: Settings },
          { href: "/dashboard/catalogo", label: "Gerenciar Produtos", icon: BookOpen },
          { href: "/dashboard/catalogo/bulk", label: "Gerenciar produtos em Massa", icon: LayoutDashboard },
        ]
      });

      navLinks.push({ href: "/dashboard/estoque", label: "Estoque", icon: Package });
      navLinks.push({ href: "/dashboard/crm", label: "CRM de Leads", icon: Kanban });

      if (!isB2C && !isCaaS) {
        navLinks.push({ href: "/dashboard/vendedores", label: "Colaboradores", icon: Users });
      }

      if (isAllService) {
        navLinks.push({ href: "/dashboard/franquias", label: "Franquias", icon: Globe });
      }
      
      if ((isB2C || isAllService) && role !== "b2b_admin" && businessModel !== "B2B") {
        navLinks.push({ href: "/dashboard/perfil#cartao", label: "Editar Cartão Público", icon: UserCircle });
      }
    } else if (role === "seller") {
      const canAccessCatalog = permissions?.dash_access_catalog;
      const canAccessAnalytics = permissions?.dash_access_analytics;
      const canAccessCompany = permissions?.dash_access_company;

      if (canAccessCompany) {
        const companySubItems = [];
        const canHours = granularPermissions?.company?.hours !== false;
        const canSeo = granularPermissions?.company?.seo !== false;
        const canDomain = granularPermissions?.company?.domain !== false;

        if (canHours) companySubItems.push({ href: "/dashboard/empresa", label: "Horário de Funcionamento", icon: Clock });
        if (canSeo) companySubItems.push({ href: "/dashboard/empresa/seo", label: "Informações e SEO", icon: Settings });
        if (canDomain) companySubItems.push({ href: "/dashboard/empresa/dominio", label: "Configurar Domínio", icon: Globe });

        if (companySubItems.length > 0) {
          navLinks.push({ 
            label: "Empresa", 
            icon: Building2,
            subItems: companySubItems
          } as any);
        }
      }

      if (canAccessCatalog) {
        const catalogSubItems = [];
        const catalogPerms = granularPermissions?.catalog || {};
        const canManageProducts = catalogPerms.create !== false || catalogPerms.edit !== false || catalogPerms.delete !== false;
        const canConfig = catalogPerms.settings_general !== false || catalogPerms.settings_behavior !== false || catalogPerms.settings_banners !== false;
        const canBulk = catalogPerms.bulk !== false;

        if (canManageProducts) {
          catalogSubItems.push({ href: "/dashboard/catalogo/gerenciador", label: "Gerenciar Catálogo", icon: BookOpen });
          catalogSubItems.push({ href: "/dashboard/catalogo", label: "Gerenciar Produtos", icon: BookOpen });
        }
        if (canConfig) {
          catalogSubItems.push({ href: "/dashboard/catalogo/configuracoes", label: "Configurar Catálogo", icon: Settings });
        }
        if (canBulk) {
          catalogSubItems.push({ href: "/dashboard/catalogo/bulk", label: "Gerenciar produtos em Massa", icon: LayoutDashboard });
        }

        if (catalogSubItems.length > 0) {
          navLinks.push({ 
            label: "Catálogo", 
            icon: BookOpen,
            subItems: catalogSubItems
          } as any);
        }
        navLinks.push({ href: "/dashboard/estoque", label: "Estoque", icon: Package });
      }

      navLinks.push({ href: "/dashboard/crm", label: "CRM de Leads", icon: Kanban });

      if (canAccessAnalytics) {
        // Analytics será adicionado ao final globalmente
      }
    }

    if (role !== "seller") {
      navLinks.push({ href: "/dashboard/assinatura", label: "Minha Assinatura", icon: CreditCard });
    }
    navLinks.push({ href: "/dashboard/perfil#perfil", label: "Perfil", icon: ShieldCheck });
    
    // ANALYTICS SEMPRE POR ÚLTIMO (Protocolo B2C)
    const canSeeAnalytics = role === "admin" || role === "b2b_admin" || role === "b2c_admin" || isActuallySuperAdmin || permissions?.dash_access_analytics;
    if (canSeeAnalytics) {
      navLinks.push({ href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 });
    }
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
        style={{ backgroundColor: "var(--dash-sidebar-bg)", borderColor: "var(--dash-border)" }}
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
          <div className={`mb-10 flex items-center ${isCollapsed ? "justify-center px-4" : "justify-between px-6"}`}>
            <Link href={isAdminPath ? "/main" : "/dashboard"} className="flex items-center gap-2 group">
              {isCollapsed ? (
                <div className="h-9 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <img src={globalIconUrl || "/icone_ps.png"} alt="Ícone Plataforma" className="h-9 w-9 object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-start overflow-hidden transition-all pt-2">
                  <img src={globalLogoUrl || "/logo_fundo_escuro_ps.png"} alt="Logo Plataforma" className="h-[54px] object-contain object-left" />
                  <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider ml-1 mt-1">
                      {isAdminPath ? "CENTRO DE INTELIGÊNCIA (QG)" : (isShadowMode ? "Modo Simulação" : (isActuallySuperAdmin ? "Painel Super Admin" : (businessModel === "B2B" ? "Painel empresarial" : "Painel Gestor")))}
                    </span>
                  <span className="text-[9px] text-gray-500 font-medium ml-1 mt-0.5">
                    Build v{packageJson.version} ({process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "local"})
                  </span>
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button onClick={onClose} className="rounded-lg p-1 text-[var(--dash-text-muted)] hover:bg-[var(--dash-hover-bg)] lg:hidden">
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
                      className={`group relative flex w-full items-center justify-between rounded-lg p-3 text-sm font-medium transition-all ${
                        isActive 
                          ? "text-white bg-primary" 
                          : "text-[var(--dash-sidebar-text)] hover:bg-[var(--dash-surface)]/10 hover:text-[var(--dash-sidebar-text-active)]"
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
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 h-7 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
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
                                    ? "text-primary font-bold" 
                                    : "text-[var(--dash-sidebar-text)] hover:text-[var(--dash-sidebar-text-active)]"
                                }`}
                                title={isCollapsed ? sub.label : ""}
                              >
                                {sub.icon && <sub.icon size={isCollapsed ? 18 : 14} />}
                                {!isCollapsed && sub.label}

                                {isSubActive && !isCollapsed && (
                                  <div className="absolute left-[-40px] h-5 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                )}
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
                  className={`group relative flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-all ${
                    isActive 
                      ? "text-white bg-primary" 
                      : "text-[var(--dash-sidebar-text)] hover:bg-[var(--dash-surface)]/10 hover:text-[var(--dash-sidebar-text-active)]"
                  } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && <span>{item.label}</span>}
                  
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 h-7 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {!isCollapsed && (
            <div className="mt-auto px-4 pb-6">
              <div className="rounded bg-[var(--dash-surface-secondary)] p-4 border border-[var(--dash-border)]">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Status do Sistema</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-[var(--dash-text-secondary)]">Operacional</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
