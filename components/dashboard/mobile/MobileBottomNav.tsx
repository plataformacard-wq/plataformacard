"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Users, Settings } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      exact: true,
    },
    {
      label: "Catálogo",
      href: "/dashboard/catalogo",
      icon: LayoutGrid,
      exact: false,
    },
    {
      label: "CRM",
      href: "/dashboard/crm",
      icon: Users,
      exact: false,
    },
    {
      label: "Settings",
      href: "/dashboard/empresa",
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 px-3 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all duration-200 relative group ${
                isActive
                  ? "text-emerald-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-200 font-medium"
              }`}
            >
              {/* Indicator Glow Top Bar for Active Item */}
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-emerald-500 shadow-[0_0_12px_#2CCB68]" />
              )}
              
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive ? "bg-emerald-500/15 shadow-[0_0_15px_rgba(44,203,104,0.2)]" : ""
                }`}
              >
                <Icon size={20} className={isActive ? "text-emerald-400" : "text-zinc-400"} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
