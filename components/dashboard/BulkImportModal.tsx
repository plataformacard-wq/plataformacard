"use client";

import { useState, useRef } from "react";
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  FileSpreadsheet,
  ExternalLink,
  Database,
  Table as TableIcon,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgId: string;
  catalogId: string;
  categories: { id: string; name: string }[];
}

type Step = "upload" | "mapping" | "preview" | "processing";

export default function BulkImportModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  orgId, 
  catalogId,
  categories 
}: BulkImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, created: 0, updated: 0, failed: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Gera um arquivo Excel (.xlsx) dinâmico com as categorias do cliente
  const generateTemplate = () => {
    const templateHeaders = [
      "Nome do Produto", 
      "Preço Venda", 
      "Preço Atacado", 
      "Qtd Mínima Atacado", 
      "SKU", 
      "Categoria", 
      "Descrição", 
      "Especificações Técnicas (Ex: Cor:Preto | Material:Alumínio)"
    ];
    
    const exampleData = [
      [
        "Exemplo: Scooter X1", 
        "2500.00", 
        "2200.00", 
        "5", 
        "SC-001", 
        categories[0]?.name || "Geral", 
        "Descrição curta aqui...", 
        "Cor:Preto | Material:Alumínio | Autonomia:40km"
      ]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([templateHeaders, ...exampleData]);
    const wsCats = XLSX.utils.json_to_sheet(categories.map(c => ({ "Categorias Disponíveis": c.name })));
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
    XLSX.utils.book_append_sheet(wb, wsCats, "Categorias");
    XLSX.writeFile(wb, "modelo_full_plataformacard.xlsx");
  };

  const productFields = [
    { key: "name", label: "Nome do Produto", required: true },
    { key: "description", label: "Descrição", required: false },
    { key: "price", label: "Preço Venda", required: false },
    { key: "wholesale_price", label: "Preço Atacado", required: false },
    { key: "wholesale_min_quantity", label: "Qtd Mín. Atacado", required: false },
    { key: "sku", label: "SKU", required: false },
    { key: "category_name", label: "Nome da Categoria", required: false },
    { key: "specs_string", label: "Especificações Técnicas", required: false },
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length > 0) {
          const headers = data[0] as string[];
          const rows = XLSX.utils.sheet_to_json(ws);
          setHeaders(headers);
          setFileData(rows);
          autoMap(headers);
          setStep("mapping");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setHeaders(results.meta.fields || []);
            setFileData(results.data);
            autoMap(results.meta.fields || []);
            setStep("mapping");
          }
        },
        error: (err) => setError("Erro ao ler CSV: " + err.message)
      });
    }
  };

  const autoMap = (incomingHeaders: string[]) => {
    const newMapping: Record<string, string> = {};
    productFields.forEach(field => {
      const match = incomingHeaders.find(h => 
        h.toLowerCase().includes(field.key.toLowerCase()) || 
        h.toLowerCase().includes(field.label.toLowerCase())
      );
      if (match) newMapping[field.key] = match;
    });
    setMapping(newMapping);
  };

  const startImport = async () => {
    setIsProcessing(true);
    setError(null);
    let created = 0;
    let failed = 0;

    try {
      // 1. Prepare data
      const productsToInsert = fileData.map(row => {
        const product: any = {
          organization_id: orgId,
          catalog_id: catalogId,
          name: row[mapping["name"]],
          description: row[mapping["description"]],
          price: parseFloat(String(row[mapping["price"]]).replace(",", ".")) || 0,
          sku: row[mapping["sku"]],
          wholesale_price: parseFloat(String(row[mapping["wholesale_price"]]).replace(",", ".")) || null,
          wholesale_min_quantity: parseInt(row[mapping["wholesale_min_quantity"]]) || null,
          has_wholesale: !!row[mapping["wholesale_price"]],
        };

        // Lógica de Especificações Técnicas (Conversor String -> JSON)
        const specsRaw = row[mapping["specs_string"]];
        if (specsRaw && typeof specsRaw === "string") {
          // Exemplo esperado: "Cor:Preto | Material:Alumínio"
          const specParts = specsRaw.split("|");
          product.specs = specParts.map(part => {
            const [label, value] = part.split(":").map(s => s.trim());
            return { label: label || "", value: value || "" };
          }).filter(s => s.label);
        }

        // Match category
        const catName = row[mapping["category_name"]];
        if (catName) {
          const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
          if (cat) product.category_id = cat.id;
        } else if (categories.length > 0) {
          product.category_id = categories[0].id;
        }

        return product;
      }).filter(p => p.name);

      // 2. Insert in batches
      const batchSize = 50;
      for (let i = 0; i < productsToInsert.length; i += batchSize) {
        const batch = productsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from("products")
          .insert(batch);

        if (insertError) {
          console.error("Erro no lote:", insertError);
          failed += batch.length;
        } else {
          created += batch.length;
        }
      }

      setStats({ total: fileData.length, created, updated: 0, failed });
      setStep("processing");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-4xl overflow-hidden rounded-[32px] border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Importação em Massa</h2>
              <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Siga os passos para importar seu catálogo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--dash-hover-bg)] rounded-full transition-colors">
            <X size={20} style={{ color: "var(--dash-text-muted)" }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {step === "upload" && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Seção de Modelos (Híbrida) */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={generateTemplate}
                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-[var(--dash-border)] rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Baixar Modelo Excel</p>
                      <p className="text-[10px] text-[var(--dash-text-muted)]">Já com suas categorias</p>
                    </div>
                  </button>

                  <a 
                    href="https://docs.google.com/spreadsheets/d/1_S6PqH_Yw7fXJp_Q7OqH6_Qz_X_M_G_Q/copy"
                    target="_blank"
                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-[var(--dash-border)] rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                      <ExternalLink size={24} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Usar Google Sheets</p>
                      <p className="text-[10px] text-[var(--dash-text-muted)]">Abrir modelo na nuvem</p>
                    </div>
                  </a>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  style={{ borderColor: "var(--dash-border)" }}
                >
                  <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload size={40} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Arraste ou clique para selecionar</p>
                    <p className="text-sm" style={{ color: "var(--dash-text-muted)" }}>Suporta arquivos .CSV, .XLSX ou .XLS</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls"
                  />
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
            )}

            {step === "mapping" && (
              <motion.div 
                key="mapping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex gap-3 items-start border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Mapeie as colunas do seu arquivo para os campos correspondentes do sistema. Campos marcados com * são obrigatórios.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {productFields.map((field) => (
                    <div 
                      key={field.key} 
                      className="flex items-center gap-4 p-4 rounded-2xl border"
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
                        className="w-64 bg-[var(--dash-surface)] border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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

                <div className="flex justify-end gap-3 pt-6">
                  <button 
                    onClick={() => setStep("upload")}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[var(--dash-hover-bg)] transition-colors"
                    style={{ color: "var(--dash-text-secondary)" }}
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => setStep("preview")}
                    disabled={!mapping["name"]}
                    className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    Continuar para Preview
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === "preview" && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border rounded-2xl overflow-hidden" style={{ borderColor: "var(--dash-border)" }}>
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
                    className="px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[var(--dash-hover-bg)] transition-colors"
                    style={{ color: "var(--dash-text-secondary)" }}
                  >
                    Ajustar Mapeamento
                  </button>
                  <button 
                    onClick={startImport}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
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
            )}

            {step === "processing" && (
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
                  <div className="bg-[var(--dash-bg)] p-4 rounded-2xl border" style={{ borderColor: "var(--dash-border)" }}>
                    <p className="text-2xl font-bold text-primary">{stats.created}</p>
                    <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Produtos Criados</p>
                  </div>
                  <div className="bg-[var(--dash-bg)] p-4 rounded-2xl border" style={{ borderColor: "var(--dash-border)" }}>
                    <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                    <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Falhas</p>
                  </div>
                </div>

                <p className="text-xs animate-pulse" style={{ color: "var(--dash-text-muted)" }}>Fechando em instantes...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="text-red-600 shrink-0" size={18} />
            <p className="text-xs text-red-800 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
