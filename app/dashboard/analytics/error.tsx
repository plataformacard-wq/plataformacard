"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro no Dashboard Analytics:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
        <AlertCircle size={32} />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">
          Ops! Erro ao carregar Analytics
        </h2>
        <p className="text-sm text-[var(--dash-text-secondary)] max-w-md mx-auto">
          Não foi possível carregar as métricas de desempenho. Isso pode ser devido a uma falha na conexão com o banco de dados ou RPCs ausentes.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left max-w-2xl w-full overflow-hidden">
        <p className="text-[10px] font-mono text-rose-500 break-all">
          {error.message}
        </p>
      </div>

      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
      >
        <RotateCcw size={16} />
        Tentar Novamente
      </button>
    </div>
  );
}
