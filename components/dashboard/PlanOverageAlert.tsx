"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface OverageItem {
  resource: string;
  label: string;
  current: number;
  limit: number;
}

interface PlanOverageAlertProps {
  overages: OverageItem[];
  planName: string;
}

export default function PlanOverageAlert({ overages, planName }: PlanOverageAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || overages.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-4 md:mx-8 mt-4 rounded-[27px] border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        {/* Ícone */}
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <AlertTriangle size={20} className="text-amber-500" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-amber-600 dark:text-amber-400 mb-1">
            Plano alterado — Uso acima do limite ({planName})
          </p>
          <div className="flex flex-wrap gap-3">
            {overages.map((item) => (
              <span
                key={item.resource}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg"
              >
                <span>{item.label}:</span>
                <span className="text-red-500">{item.current}</span>
                <span className="opacity-60">/</span>
                <span>{item.limit}</span>
              </span>
            ))}
          </div>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1.5">
            Dados existentes preservados. Novos cadastros bloqueados até regularização.
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/dashboard/empresa/seo"
            className="flex items-center gap-1.5 text-xs font-black text-amber-600 hover:text-amber-500 transition-colors"
          >
            Regularizar <ArrowRight size={12} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
            title="Dispensar aviso"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
