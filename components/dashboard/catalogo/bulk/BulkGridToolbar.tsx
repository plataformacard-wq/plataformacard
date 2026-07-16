"use client";
import React from "react";
import { Plus, Save, Loader2, Database, Download, RefreshCw, Tags, CheckCircle, X, Megaphone } from "lucide-react";
import * as XLSX from "xlsx";

export default function BulkGridToolbar(props: any) {
  const {
    addRow,
    handleSave,
    saving,
    data,
    presence,
    setShowImportModal,
    isExporting,
    setIsExporting,
    categories,
    handleDirectSheetSync,
    isSyncingSheets,
    storedSheetUrl,
    setShowPromoModal,
    setData,
  } = props;

  return (
    <>
      {/* --- Toolbar Refatorada --- */}
      <div className="flex flex-col gap-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 rounded-[27px] shadow-sm">
        
        {/* Linha 1: Ações Principais e Integrações */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          {/* Esquerda: Ações Principais */}
          <div className="flex items-center gap-3">
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all border-none"
            >
              <Plus size={18} />
              Novo Produto
            </button>

            <button
              onClick={handleSave}
              disabled={saving || data.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-900/20"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar Alterações
            </button>
            
            {presence.length > 1 && (
              <>
                <div className="h-6 w-px bg-[var(--dash-border)] mx-1" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider hidden sm:inline-block">
                    Online:
                  </span>
                  <div className="flex -space-x-2">
                    {presence.map((p: any, i: number) => (
                      <div 
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-[var(--dash-surface)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: p.color }}
                        title={p.user}
                      >
                        {p.user[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Direita: Ferramentas de Dados */}
          <div className="flex flex-wrap items-center gap-2 bg-[var(--dash-hover-bg)] p-1.5 rounded-xl border border-[var(--dash-border)]">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--dash-text-primary)] hover:bg-[var(--dash-surface)] hover:shadow-sm rounded-lg transition-all"
              title="Importar arquivos locais"
            >
              <Database size={16} />
              Importar
            </button>
            
            <button
              onClick={async () => {
                if (isExporting) return;
                setIsExporting(true);

                try {
                  // Yield para garantir que o Loader comece a girar imediatamente
                  await new Promise(resolve => setTimeout(resolve, 150));

                  const templateHeaders = ["Nome do Produto", "Preço Venda", "Preço Atacado", "Qtd Mínima Atacado", "SKU", "Categoria", "Descrição", "Especificações Técnicas", "URL da Imagem Principal", "URLs da Galeria"];
                  let exportData: any[][] = [];

                  if (data.length === 0) {
                    exportData = [["Exemplo: Scooter X1", "2500.00", "2200.00", "5", "SC-001", categories[0]?.name || "Geral", "Descrição curta aqui...", "Cor:Preto | Material:Alumínio", "https://i.imgur.com/exemplo1.png", "https://i.imgur.com/exemplo2.png, https://i.imgur.com/exemplo3.png"]];
                  } else {
                    // Mapeamento de dados (pode ser pesado)
                    exportData = data.map((product: any) => {
                      let specsStr = "";
                      if (Array.isArray(product.specs)) {
                        specsStr = product.specs
                          .map((s: any) => `${s.chave || s.label || s.name || ''}:${s.valor || s.value || ''}`)
                          .join(" | ");
                      } else if (product.specs && typeof product.specs === 'object') {
                        specsStr = Object.entries(product.specs)
                          .map(([key, val]) => `${key}:${val}`)
                          .join(" | ");
                      }
                      
                      const categoryName = categories.find((c: any) => c.id === product.category_id)?.name || "";
                      
                      const mainImageUrl = product.image_url || "";
                      const galleryUrls = Array.isArray(product.image_urls) ? product.image_urls.join(",") : "";

                      return [
                        product.name || "",
                        product.price !== null && product.price !== undefined ? product.price.toString() : "",
                        product.wholesale_price !== null && product.wholesale_price !== undefined ? product.wholesale_price.toString() : "",
                        product.wholesale_min_quantity !== null && product.wholesale_min_quantity !== undefined ? product.wholesale_min_quantity.toString() : "",
                        product.sku || "",
                        categoryName,
                        product.description || "",
                        specsStr,
                        mainImageUrl,
                        galleryUrls
                      ];
                    });
                  }

                  // Yield após o mapeamento de dados
                  await new Promise(resolve => setTimeout(resolve, 50));

                  const wb = XLSX.utils.book_new();
                  const ws = XLSX.utils.aoa_to_sheet([templateHeaders, ...exportData]);
                  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
                  ws['!protect'] = { password: 'plataformashop' };
                  const wsCats = XLSX.utils.json_to_sheet(categories.map((c: any) => ({ "Categorias Disponíveis": c.name })));
                  
                  // Yield antes de injetar as abas e salvar (operações mais pesadas)
                  await new Promise(resolve => setTimeout(resolve, 50));

                  XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
                  XLSX.utils.book_append_sheet(wb, wsCats, "Categorias");
                  
                  const fileName = data.length > 0 ? "catalogo_exportado.xlsx" : "plataformashop_modelo.xlsx";
                  XLSX.writeFile(wb, fileName);
                } finally {
                  // Como o writeFile é muito rápido mas o navegador pode demorar para disparar
                  // o popup de download, mantemos o Loader ativo por mais alguns segundos
                  // para garantir feedback visual contínuo.
                  setTimeout(() => {
                    setIsExporting(false);
                  }, 3500);
                }
              }}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--dash-text-secondary)] hover:bg-[var(--dash-surface)] hover:shadow-sm rounded-lg transition-all disabled:opacity-50"
              title="Exportar catálogo atual para Excel"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? "Exportando..." : "Exportar"}
            </button>

            <button
              onClick={handleDirectSheetSync}
              disabled={isSyncingSheets}
              className="flex items-center gap-2 px-3 py-1.5 ml-1 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-900/10"
              title={storedSheetUrl ? "Sincronizar agora com o Google Sheets salvo" : "Configurar Google Sheets para sincronização"}
            >
              {isSyncingSheets ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Sincronizar Sheets
            </button>
          </div>
        </div>

        {/* Separador */}
        <div className="w-full h-px bg-[var(--dash-border)]" />

        {/* Linha 2: Ações em Massa */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-bold text-[var(--dash-text-muted)] uppercase tracking-wider whitespace-nowrap">
            Ações em Massa:
          </span>
          
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-600 border border-purple-600/20 rounded-xl font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm"
              title="Ajustar preços e promoções em lote"
            >
              <Tags size={16} />
              Ajustes e Promoções
            </button>

            <div className="h-6 w-px bg-[var(--dash-border)] mx-1" />

            <div className="flex bg-[var(--dash-hover-bg)] rounded-xl border border-[var(--dash-border)] p-1 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => {
                  if (confirm("Deseja ATIVAR todos os produtos carregados nesta lista?")) {
                    setData(data.map((p: any) => ({ ...p, is_active: true })));
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all font-bold text-xs whitespace-nowrap"
                title="Ativar todos os produtos"
              >
                <CheckCircle size={14} /> Ativar Todos
              </button>
              <button
                onClick={() => {
                  if (confirm("Deseja DESATIVAR todos os produtos carregados nesta lista?")) {
                    setData(data.map((p: any) => ({ ...p, is_active: false })));
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all font-bold text-xs whitespace-nowrap"
                title="Desativar todos os produtos"
              >
                <X size={14} /> Desativar Todos
              </button>
              
              <div className="w-px h-6 bg-[var(--dash-border)] mx-1 self-center" />

              <button
                onClick={() => {
                  const text = prompt("Digite o texto de destaque para o Banner Promocional (ex: OFERTA, NOVIDADE):", "DESTAQUE");
                  if (text !== null) {
                    setData(data.map((p: any) => ({ ...p, show_highlight: true, highlight_text: text })));
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10 transition-all font-bold text-xs whitespace-nowrap"
                title="Destacar todos os produtos no Banner Promocional"
              >
                <Megaphone size={14} /> Ativar no Banner
              </button>
              <button
                onClick={() => {
                  if (confirm("Deseja REMOVER todos os produtos do Banner Promocional?")) {
                    setData(data.map((p: any) => ({ ...p, show_highlight: false, highlight_text: null })));
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-500/10 transition-all font-bold text-xs whitespace-nowrap"
                title="Remover todos os produtos do Banner Promocional"
              >
                <X size={14} /> Remover do Banner
              </button>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}
