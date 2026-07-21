"use client";

import React from "react";
import { ShieldCheck, Lock, CreditCard, Award, Zap, CheckCircle } from "lucide-react";

export default function SecurityBadges() {
  return (
    <div className="w-full space-y-4 pt-4">
      {/* Grid de Grid de Garantias de Segurança */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Badge 1: SSL 256-bit */}
        <div className="p-3 rounded-2xl border border-white/10 bg-[#0A0A0A] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">SSL 256-Bit</span>
            <span className="text-[10px] text-zinc-500 block">Conexão Criptografada</span>
          </div>
        </div>

        {/* Badge 2: PCI-DSS */}
        <div className="p-3 rounded-2xl border border-white/10 bg-[#0A0A0A] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">PCI-DSS Level 1</span>
            <span className="text-[10px] text-zinc-500 block">Padrão Bancário</span>
          </div>
        </div>

        {/* Badge 3: 7 Dias Garantia */}
        <div className="p-3 rounded-2xl border border-white/10 bg-[#0A0A0A] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Award size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">7 Dias Garantia</span>
            <span className="text-[10px] text-zinc-500 block">Risco Zero Absoluto</span>
          </div>
        </div>

        {/* Badge 4: Liberação Imediata */}
        <div className="p-3 rounded-2xl border border-white/10 bg-[#0A0A0A] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">Acesso Imediato</span>
            <span className="text-[10px] text-zinc-500 block">Ativação Automática</span>
          </div>
        </div>
      </div>

      {/* Faixa de Formas de Pagamento Aceitas & Processador */}
      <div className="p-4 rounded-2xl border border-white/10 bg-[#141414] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <CheckCircle size={14} className="text-emerald-400" />
          <span className="font-semibold">Pagamentos aceitos via Pix e Cartão de Crédito em até 12x</span>
        </div>

        {/* Logos/Badges Texto Estilizados dos Cartões e Gateway */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-1 rounded bg-[#0A0A0A] border border-white/10 text-[10px] font-black tracking-wider text-emerald-400">
            PIX
          </span>
          <span className="px-2 py-1 rounded bg-[#0A0A0A] border border-white/10 text-[10px] font-black tracking-wider text-blue-400">
            VISA
          </span>
          <span className="px-2 py-1 rounded bg-[#0A0A0A] border border-white/10 text-[10px] font-black tracking-wider text-orange-400">
            MASTER
          </span>
          <span className="px-2 py-1 rounded bg-[#0A0A0A] border border-white/10 text-[10px] font-black tracking-wider text-yellow-400">
            ELO
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-extrabold tracking-wider text-emerald-400">
            KIWIFY
          </span>
        </div>
      </div>
    </div>
  );
}
