import React from "react";
import { Trash2, X, CheckCircle2 } from "lucide-react";

export function VendedorFooterActions(props: any) {
  const {
    selectedSeller,
    showTerminateConfirm,
    setShowTerminateConfirm,
    handleTerminate,
    terminating,
    message,
    handleSave,
    saving,
    isFormValid,
  } = props;

  return (
    <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
      <div className="flex items-center gap-4 relative">
        {selectedSeller && selectedSeller.status !== 'terminated' && (
          <>
            {!showTerminateConfirm ? (
              <button 
                onClick={() => setShowTerminateConfirm(true)}
                className="px-4 py-2 text-sm rounded-xl font-bold transition-all text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 opacity-60 hover:opacity-100"
              >
                <Trash2 size={16} /> Desligar Vendedor
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 p-2 rounded-2xl border border-red-200 dark:border-red-900 absolute left-0 bottom-full mb-4 whitespace-nowrap z-20 shadow-2xl origin-bottom-left animate-in fade-in zoom-in duration-200">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 px-2">
                  Desligar permanentemente? Os dados pessoais serão removidos.
                </span>
                <button 
                  onClick={handleTerminate}
                  disabled={terminating}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {terminating ? "Desligando..." : "Confirmar"}
                </button>
                <button 
                  onClick={() => setShowTerminateConfirm(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancelar
                </button>
              </div>
            )}
          </>
        )}
        {message && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            message.toLowerCase().includes("erro") || 
            message.toLowerCase().includes("negada") || 
            message.toLowerCase().includes("banco") 
            ? "bg-red-500/10 border-red-500/20 text-red-500" 
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
          }`}>
            {message.toLowerCase().includes("erro") || 
             message.toLowerCase().includes("negada") || 
             message.toLowerCase().includes("banco") 
              ? <X size={16} /> 
              : <CheckCircle2 size={16} />
            }
            <span className="text-sm font-bold">{message}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={handleSave} 
          disabled={saving || !isFormValid}
          className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
            saving || !isFormValid 
            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none" 
            : "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-emerald-500/20"
          }`}
        >
          {saving ? "Salvando..." : "Salvar Ficha do Vendedor"}
        </button>
      </div>
    </div>
  );
}
