"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RotateCcw, Loader2, Check, AlertCircle } from "lucide-react";
import { createCheckpointAction } from "@/app/dashboard/analytics/actions";
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsControlsProps {
  organizationId: string;
  profileId: string;
}

const PERIODS = [
  { label: "Hoje", value: "today" },
  { label: "7 Dias", value: "7d" },
  { label: "30 Dias", value: "30d" },
  { label: "Mês", value: "month" },
  { label: "Ano", value: "year" },
  { label: "Total", value: "all" },
];

export default function AnalyticsControls({ organizationId, profileId }: AnalyticsControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentPeriod = searchParams.get("period") || "all";

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const result = await createCheckpointAction(organizationId, profileId);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setShowConfirm(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      {/* Period Selectors */}
      <div className="flex items-center gap-1 bg-dash-bg border border-border p-1 rounded-[27px] overflow-x-auto no-scrollbar max-w-full">
        {PERIODS.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
            disabled={isPending}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              currentPeriod === period.value
                ? "bg-primary text-white shadow-lg"
                : "text-dash-text-muted hover:text-dash-text-primary hover:bg-zinc-500/10"
            } ${isPending && currentPeriod !== period.value ? "opacity-50" : ""}`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Reset Button & Confirmation */}
      <div className="relative">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <RotateCcw size={14} />
            Resetar Estatísticas
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-1.5 bg-dash-bg border border-rose-500/50 rounded-[27px] shadow-2xl z-10"
          >
            {success ? (
              <div className="flex items-center gap-2 px-4 py-1.5 text-emerald-500">
                <Check size={16} className="animate-bounce" />
                <span className="text-xs font-black">Resetado com Sucesso!</span>
              </div>
            ) : (
              <>
                <div className="px-3 py-1.5">
                  <p className="text-[10px] font-black text-dash-text-primary leading-tight">Confirmar Reset?</p>
                  <p className="text-[8px] font-bold text-dash-text-muted">Ação reversível via banco.</p>
                </div>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isResetting}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black text-dash-text-muted hover:bg-zinc-500/10 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black bg-rose-600 text-white hover:bg-rose-700 transition-all disabled:opacity-50"
                >
                  {isResetting ? <Loader2 size={12} className="animate-spin" /> : "Confirmar"}
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
