"use client";

import { Download, Printer } from "lucide-react";

export default function PrintReportButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90 transition-all shadow-lg shadow-primary/20 no-print"
    >
      <Download size={14} />
      Exportar Relatório de Conversão
    </button>
  );
}
