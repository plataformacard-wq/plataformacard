import React from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

type Step = "upload" | "mapping" | "preview" | "processing";

interface BulkImportPreviewStepProps {
  productFields: { key: string; label: string; required: boolean }[];
  mapping: Record<string, string>;
  fileData: any[];
  setStep: (step: Step) => void;
  startImport: () => void;
  isProcessing: boolean;
}

export default function BulkImportPreviewStep({
  productFields,
  mapping,
  fileData,
  setStep,
  startImport,
  isProcessing,
}: BulkImportPreviewStepProps) {
  return (
    <motion.div 
      key="preview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--dash-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--dash-hover-bg)]/50">
              <tr>
                {productFields.filter(f => mapping[f.key]).map(f => (
                  <th key={f.key} className="px-4 py-3 font-bold" style={{ color: "var(--dash-text-secondary)" }}>{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileData.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--dash-border)" }}>
                  {productFields.filter(f => mapping[f.key]).map(f => (
                    <td key={f.key} className="px-4 py-3" style={{ color: "var(--dash-text-primary)" }}>
                      {row[mapping[f.key]] || <span className="text-xs italic text-[var(--dash-text-muted)]">vazio</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {fileData.length > 5 && (
          <div className="p-3 text-center border-t bg-[var(--dash-surface)]" style={{ borderColor: "var(--dash-border)" }}>
            <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Exibindo 5 de {fileData.length} registros...</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button 
          onClick={() => setStep("mapping")}
          className="px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[var(--dash-hover-bg)] transition-colors"
          style={{ color: "var(--dash-text-secondary)" }}
        >
          Ajustar Mapeamento
        </button>
        <button 
          onClick={startImport}
          disabled={isProcessing}
          className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Confirmar e Importar {fileData.length} itens
              <Check size={18} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
