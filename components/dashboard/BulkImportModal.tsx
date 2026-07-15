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

import BulkImportUploadStep from "./catalogo/bulk/BulkImportUploadStep";
import BulkImportMappingStep from "./catalogo/bulk/BulkImportMappingStep";
import BulkImportPreviewStep from "./catalogo/bulk/BulkImportPreviewStep";
import BulkImportProcessingStep from "./catalogo/bulk/BulkImportProcessingStep";
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
      password: 'plataformashop',
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
    XLSX.writeFile(wb, "plataformashop_v1.0.xlsx");
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
    { key: "image_url", label: "URL da Imagem Principal", required: false },
    { key: "image_urls", label: "URLs da Galeria", required: false },
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
          image_url: row[mapping["image_url"]] || null,
        };

        const galleryRaw = row[mapping["image_urls"]];
        if (galleryRaw && typeof galleryRaw === "string") {
          product.image_urls = galleryRaw.split(",").map(url => url.trim()).filter(Boolean);
        } else {
          product.image_urls = [];
        }

        // Lógica de Especificações Técnicas (Conversor String -> JSON)
        const specsRaw = row[mapping["specs_string"]];
        if (specsRaw && typeof specsRaw === "string") {
          const specParts = specsRaw.split("|");
          product.specs = specParts.map(part => {
            const [chave, valor] = part.split(":").map(s => s.trim());
            return { chave: chave || "", valor: valor || "", custom: true, id: Math.random().toString(36).substring(7) };
          }).filter(s => s.chave);
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
              <BulkImportUploadStep
                generateTemplate={generateTemplate}
                sheetUrl={sheetUrl}
                setSheetUrl={setSheetUrl}
                handleFetchSheet={handleFetchSheet}
                isFetchingUrl={isFetchingUrl}
                fileInputRef={fileInputRef}
                handleFileUpload={handleFileUpload}
              />
            )}

            {step === "mapping" && (
              <BulkImportMappingStep
                productFields={productFields}
                mapping={mapping}
                setMapping={setMapping}
                headers={headers}
                setStep={setStep}
              />
            )}

            {step === "preview" && (
              <BulkImportPreviewStep
                productFields={productFields}
                mapping={mapping}
                fileData={fileData}
                setStep={setStep}
                startImport={startImport}
                isProcessing={isProcessing}
              />
            )}

            {step === "processing" && (
              <BulkImportProcessingStep
                stats={stats}
              />
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
