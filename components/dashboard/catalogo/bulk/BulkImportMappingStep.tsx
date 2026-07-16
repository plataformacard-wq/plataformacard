import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, ChevronRight, ArrowRight } from "lucide-react";

type Step = "upload" | "mapping" | "preview" | "processing";

interface BulkImportMappingStepProps {
  productFields: { key: string; label: string; required: boolean }[];
  mapping: Record<string, string>;
  setMapping: (mapping: Record<string, string>) => void;
  headers: string[];
  setStep: (step: Step) => void;
}

export default function BulkImportMappingStep({
  productFields,
  mapping,
  setMapping,
  headers,
  setStep,
}: BulkImportMappingStepProps) {
  return (
    <motion.div 
      key="mapping"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex gap-3 items-start border border-amber-200 dark:border-amber-800">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          Mapeie as colunas do seu arquivo para os campos correspondentes do sistema. Campos marcados com * são obrigatórios.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {productFields.map((field) => (
          <div 
            key={field.key} 
            className="flex items-center gap-4 p-4 rounded-lg border"
            style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </p>
            </div>
            <ChevronRight size={16} className="text-[var(--dash-text-muted)]" />
            <select 
              value={mapping[field.key] || ""}
              onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
              className="dash-select w-64 bg-[var(--dash-surface)] border rounded-lg pl-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            >
              <option value="">Não importar</option>
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pr-10 py-3 pt-6">
        <button 
          onClick={() => setStep("upload")}
          className="px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[var(--dash-hover-bg)] transition-colors"
          style={{ color: "var(--dash-text-secondary)" }}
        >
          Voltar
        </button>
        <button 
          onClick={() => setStep("preview")}
          disabled={!mapping["name"]}
          className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          Continuar para Preview
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
