"use client";

import { Bell, ChevronDown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface MobileKpiHeaderProps {
  nome: string;
  avatarUrl?: string | null;
  orgName?: string | null;
  productCount?: number;
  salesTotal?: string;
  leadsCount?: number;
  notificationsCount?: number;
}

export function MobileKpiHeader({
  nome,
  avatarUrl,
  orgName = "Minha Loja B2B",
  productCount = 128,
  salesTotal = "R$ 4.250,00",
  leadsCount = 8,
  notificationsCount = 3,
}: MobileKpiHeaderProps) {
  return (
    <div className="md:hidden space-y-5 mb-6">
      {/* 📱 TOP BAR: AVATAR + STORE SELECTOR + BELL */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* User Info with Online Status */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-md">
              <img
                src={avatarUrl || "/avatar_placeholder.png"}
                alt={nome}
                className="w-full h-full rounded-full object-cover bg-zinc-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo_fundo_escuro_ps.png";
                }}
              />
            </div>
            {/* Green Online Dot */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0a]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 block leading-none">Status</span>
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
        </div>

        {/* Store Dropdown & Notifications */}
        <div className="flex items-center gap-2">
          {/* Custom Select with User Rule dash-select class */}
          <div className="relative">
            <select className="dash-select bg-zinc-900/90 border border-zinc-800 rounded-lg pl-3 py-1.5 text-xs font-bold text-zinc-200 shadow-inner outline-none focus:border-emerald-500">
              <option value="main">{orgName || "Minha Loja B2B"}</option>
            </select>
          </div>

          {/* Bell Notifications */}
          <div className="relative">
            <button className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center relative hover:bg-zinc-800 transition-colors">
              <Bell size={17} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-md">
                  {notificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KPI CAROUSEL (SWIPEABLE HORIZONTAL LIST) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {/* Card 1: Vendas Hoje (Com Sparkline) */}
        <div className="min-w-[170px] flex-1 bg-gradient-to-b from-emerald-950/40 to-zinc-900/90 border border-emerald-500/30 rounded-[27px] p-4 shadow-[0_0_20px_rgba(44,203,104,0.1)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-zinc-400">Vendas Hoje</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-lg font-black text-white tracking-tight">{salesTotal}</p>

          {/* SVG Sparkline Curve */}
          <div className="mt-2 h-6 w-full opacity-80">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path
                d="M 0 20 Q 25 5, 50 15 T 100 5"
                fill="none"
                stroke="#2CCB68"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Produtos Ativos */}
        <div className="min-w-[120px] bg-zinc-900/80 border border-white/10 rounded-[27px] p-4 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-400 leading-tight">Produtos<br/>Ativos</span>
          <p className="text-2xl font-black text-white mt-2">{productCount}</p>
        </div>

        {/* Card 3: Leads Kanban */}
        <div className="min-w-[120px] bg-zinc-900/80 border border-white/10 rounded-[27px] p-4 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-400 leading-tight">Leads<br/>Kanban</span>
          <p className="text-2xl font-black text-white mt-2">{leadsCount}</p>
        </div>
      </div>
    </div>
  );
}
