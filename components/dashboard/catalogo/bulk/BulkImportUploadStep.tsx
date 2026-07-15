import React from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, RefreshCw, Loader2, Check, AlertCircle, Table as TableIcon } from "lucide-react";

interface BulkImportUploadStepProps {
  generateTemplate: () => void;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  handleFetchSheet: () => void;
  isFetchingUrl: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BulkImportUploadStep({
  generateTemplate,
  sheetUrl,
  setSheetUrl,
  handleFetchSheet,
  isFetchingUrl,
  fileInputRef,
  handleFileUpload,
}: BulkImportUploadStepProps) {
  return (
    <motion.div 
      key="upload"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Novo Fluxo Guiado 1-2-3 */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Linha Conectora (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-[var(--dash-border)] -z-0" />

          {/* Passo 1 */}
          <div className="relative flex flex-col items-center text-center gap-4 group">
            <div className="z-10 h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              1
            </div>
            <div className="flex-1 p-6 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] hover:border-primary/50 transition-all w-full flex flex-col items-center gap-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <FileSpreadsheet size={24} />
              </div>
              <h4 className="font-bold text-sm">Baixar Modelo</h4>
              <p className="text-[10px] text-[var(--dash-text-muted)]">Template configurado com suas categorias.</p>
              <button 
                onClick={generateTemplate}
                className="mt-2 w-full py-2 bg-primary/10 text-primary rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
              >
                Download Excel
              </button>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="relative flex flex-col items-center text-center gap-4 group">
            <div className="z-10 h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              2
            </div>
            <div className="flex-1 p-6 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] hover:border-primary/50 transition-all w-full flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Upload size={24} />
              </div>
              <h4 className="font-bold text-sm">Subir no Sheets</h4>
              <p className="text-[10px] text-[var(--dash-text-muted)]">Arraste para o seu Google Drive e abra como Planilha.</p>
              <div className="mt-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-medium border border-blue-100">
                Compartilhe como "Qualquer pessoa com o link"
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="relative flex flex-col items-center text-center gap-4 group">
            <div className="z-10 h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              3
            </div>
            <div className="flex-1 p-6 rounded-xl border border-primary bg-primary/5 transition-all w-full flex flex-col items-center gap-3 shadow-xl shadow-primary/5">
              <div className="p-3 bg-primary text-white rounded-xl">
                <RefreshCw size={24} />
              </div>
              <h4 className="font-bold text-sm text-primary">Conectar & Sync</h4>
              <p className="text-[10px] text-[var(--dash-text-muted)]">Cole o link da planilha abaixo para sincronizar.</p>
              
              <div className="mt-2 w-full flex gap-2">
                <input 
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="Link do Google Sheets..."
                  className="flex-1 bg-white border border-primary/20 rounded-lg px-2 py-2 text-[9px] outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  onClick={handleFetchSheet}
                  disabled={isFetchingUrl || !sheetUrl}
                  className="px-3 bg-primary text-white rounded-lg font-bold text-[9px] hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {isFetchingUrl ? <Loader2 size={12} className="animate-spin" /> : 'Sincronizar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Opção Secundária (Upload Local) */}
        <div className="pt-8 border-t border-[var(--dash-border)]">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed rounded-xl p-6 flex items-center justify-between gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            style={{ borderColor: "var(--dash-border)" }}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[var(--dash-hover-bg)] flex items-center justify-center text-[var(--dash-text-muted)] group-hover:text-primary transition-colors">
                <Upload size={24} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>Prefere upload manual?</p>
                <p className="text-[10px]" style={{ color: "var(--dash-text-muted)" }}>Arraste ou clique para selecionar um arquivo .CSV ou .XLSX local</p>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".csv,.xlsx,.xls"
            />
            <div className="px-4 py-2 bg-[var(--dash-hover-bg)] rounded-xl text-[10px] font-bold" style={{ color: "var(--dash-text-secondary)" }}>
              Selecionar Arquivo
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[
          { icon: <Check size={16} />, title: "Rápido", desc: "Importe milhares de itens em segundos" },
          { icon: <TableIcon size={16} />, title: "Flexível", desc: "Mapeie colunas do seu jeito" },
          { icon: <AlertCircle size={16} />, title: "Seguro", desc: "Validação automática de dados" }
        ].map((feat, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--dash-hover-bg)] flex items-center justify-center text-primary">
              {feat.icon}
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>{feat.title}</p>
            <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
