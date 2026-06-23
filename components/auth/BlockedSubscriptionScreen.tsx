"use client";

import React from "react";
import { AlertTriangle, LogOut, ArrowRight, LifeBuoy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BlockedSubscriptionScreen({ status }: { status?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/entrar");
  };

  const isCanceled = status === "canceled";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-600 dark:text-red-500" size={32} />
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Acesso Suspenso
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
          {isCanceled 
            ? "Sua assinatura foi cancelada. O painel e a vitrine pública estão desativados."
            : "Identificamos uma pendência na sua assinatura. O acesso ao painel e ao catálogo público foi temporariamente suspenso."}
        </p>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            onClick={() => {
              // Aqui pode redirecionar para portal da Stripe ou página de suporte
              window.open("https://wa.me/5511999999999?text=Preciso%20ajuda%20com%20minha%20assinatura", "_blank");
            }}
          >
            Falar com Suporte <LifeBuoy size={18} />
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 py-3 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Sair da Conta <LogOut size={16} />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
          <p>Seus dados serão mantidos por 24 meses antes da exclusão permanente.</p>
        </div>
      </div>
    </div>
  );
}
