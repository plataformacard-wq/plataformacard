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
  ChevronRight,
  RefreshCw
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
  
  const [sheetUrl, setSheetUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Gera um arquivo Excel (.xlsx) dinâmico com as categorias do cliente v1.0
  const generateTemplate = () => {
    const templateHeaders = [
      "Nome do Produto", 
      "Preço Venda", 
      "Preço Atacado", 
      "Qtd Mínima Atacado", 
      "SKU", 
      "Categoria", 
      "Descrição", 
      "Especificações Técnicas"
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
    
    // Trava a primeira linha (Cabeçalho)
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Ativa a proteção da planilha (Trancar Títulos)
    ws['!protect'] = {
      password: 'plataformacard',
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: true,
      insertHyperlinks: true,
      deleteColumns: false,
      deleteRows: true,
      sort: true,
      autoFilter: true,
      pivotTables: false
    };

    const wsCats = XLSX.utils.json_to_sheet(categories.map(c => ({ "Categorias Disponíveis": c.name })));
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
    XLSX.utils.book_append_sheet(wb, wsCats, "Categorias");
    XLSX.writeFile(wb, "plataformacard_v1.0.xlsx");
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

  const handleFetchSheet = async () => {
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      setError("Por favor, insira um link válido do Google Sheets.");
      return;
    }

    setIsFetchingUrl(true);
    setError(null);

    try {
      // O "Pulo do Gato": Converte o link de edição em um link de exportação CSV direta
      let fetchUrl = sheetUrl;
      if (sheetUrl.includes("/edit")) {
        fetchUrl = sheetUrl.split("/edit")[0] + "/export?format=csv";
      } else if (!sheetUrl.endsWith("/export?format=csv")) {
        fetchUrl = sheetUrl.replace(/\/$/, "") + "/export?format=csv";
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Não foi possível acessar a planilha. Verifique se ela está compartilhada como 'Qualquer pessoa com o link'.");

      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setHeaders(results.meta.fields || []);
            setFileData(results.data);
            autoMap(results.meta.fields || []);
            setStep("mapping");
          } else {
            setError("A planilha parece estar vazia.");
          }
        },
        error: (err: any) => setError("Erro ao processar dados da planilha: " + err.message)
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetchingUrl(false);
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
      // 1. Identificar categorias únicas na planilha
      const uniqueSheetCategories = Array.from(new Set(
        fileData.map(row => row[mapping["category_name"]])
                .filter(name => name && typeof name === "string")
                .map(name => name.trim())
      ));

      // 2. Verificar quais não existem e criá-las
      const existingMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
      const newCategoriesToCreate = uniqueSheetCategories.filter(name => !existingMap.has(name.toLowerCase()));
      
      const currentCategories = [...categories];

      if (newCategoriesToCreate.length > 0) {
        const { data: createdCats, error: catError } = await supabase
          .from("categories")
          .insert(newCategoriesToCreate.map(name => ({
            name,
            organization_id: orgId,
            catalog_id: catalogId,
            sort_order: 99 // Coloca no final por padrão
          })))
          .select();

        if (catError) throw new Error("Erro ao criar novas categorias: " + catError.message);
        if (createdCats) {
          currentCategories.push(...createdCats);
        }
      }

      // Mapa final atualizado com IDs novos e antigos
      const finalCategoryMap = new Map(currentCategories.map(c => [c.name.toLowerCase(), c.id]));

      // 3. Preparar produtos para inserção
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
          const specParts = specsRaw.split("|");
          product.specs = specParts.map(part => {
            const [label, value] = part.split(":").map(s => s.trim());
            return { label: label || "", value: value || "" };
          }).filter(s => s.label);
        }

        // Vincular à categoria (Nova ou Existente)
        const catName = row[mapping["category_name"]]?.toString().trim().toLowerCase();
        if (catName && finalCategoryMap.has(catName)) {
          product.category_id = finalCategoryMap.get(catName);
        } else if (currentCategories.length > 0) {
          product.category_id = currentCategories[0].id;
        }

        return product;
      }).filter(p => p.name);

      // 4. Inserção de produtos em lotes
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
        className="w-full max-w-4xl overflow-hidden rounded-xl border shadow-2xl flex flex-col max-h-[90vh]"
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
            )}

            {step === "mapping" && (
              <motion.div 
                key="mapping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex gap-3 items-start border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Mapeie as colunas do seu arquivo para os campos correspondentes do sistema. Campos marcados com * são obrigatórios.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {productFields.map((field) => (
                    <div 
                      key={field.key} 
                      className="flex items-center gap-4 p-4 rounded-xl border"
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
                        className="dash-select w-64 bg-[var(--dash-surface)] border rounded-xl pl-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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

                <div className="flex justify-end ga pl-3 pr-10 py-3  pt-6 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:calc(100%-20px)_center] bg-no-repeat">
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
                <div className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--dash-border)" }}>
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
