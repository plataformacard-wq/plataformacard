import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface BulkImportProcessingStepProps {
  stats: {
    total: number;
    created: number;
    updated: number;
    failed: number;
  };
}

export default function BulkImportProcessingStep({ stats }: BulkImportProcessingStepProps) {
  return (
    <motion.div 
      key="processing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
        <Check size={48} className="animate-bounce" />
      </div>
      <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--dash-text-primary)" }}>Importação Concluída!</h3>
      <p className="text-[var(--dash-text-secondary)] mb-8 max-w-md">
        Seus produtos foram processados com sucesso e já estão disponíveis no seu catálogo.
      </p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
        <div className="bg-[var(--dash-bg)] p-4 rounded-xl border" style={{ borderColor: "var(--dash-border)" }}>
          <p className="text-2xl font-bold text-primary">{stats.created}</p>
          <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Produtos Criados</p>
        </div>
        <div className="bg-[var(--dash-bg)] p-4 rounded-xl border" style={{ borderColor: "var(--dash-border)" }}>
          <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
          <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Falhas</p>
        </div>
      </div>

      <p className="text-xs animate-pulse" style={{ color: "var(--dash-text-muted)" }}>Fechando em instantes...</p>
    </motion.div>
  );
}
