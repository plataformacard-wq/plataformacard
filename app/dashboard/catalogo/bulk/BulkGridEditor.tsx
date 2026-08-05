"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BulkImportModal from "@/components/dashboard/BulkImportModal";
import BulkPromoModal from "@/components/dashboard/BulkPromoModal";
import ProductDetailDrawer from "@/components/dashboard/ProductDetailDrawer";
import BulkGridToolbar from "@/components/dashboard/catalogo/bulk/BulkGridToolbar";
import BulkEditorTable from "@/components/dashboard/catalogo/bulk/BulkEditorTable";
import { useBulkEditorManager } from "@/app/dashboard/catalogo/bulk/useBulkEditorManager";

export default function BulkGridEditor() {
  const manager = useBulkEditorManager();

  if (manager.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden flex flex-col items-center justify-center p-8 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] text-center space-y-4 shadow-sm my-10">
        <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-[27px] flex items-center justify-center mb-2">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Dispositivo não Suportado</h2>
        <p className="text-sm text-[var(--dash-text-secondary)]">
          O gerenciamento em massa requer uma tela maior para exibir a grade de dados adequadamente. Por favor, acesse esta ferramenta pelo computador ou tablet.
        </p>
      </div>

      <div className="hidden md:flex flex-col gap-4">
        <BulkGridToolbar
          addRow={manager.addRow}
          handleSave={manager.handleSave}
          saving={manager.saving}
          data={manager.data}
          presence={manager.presence}
          setShowImportModal={manager.setShowImportModal}
          isExporting={manager.isExporting}
          setIsExporting={manager.setIsExporting}
          categories={manager.categories}
          handleDirectSheetSync={manager.handleDirectSheetSync}
          isSyncingSheets={manager.isSyncingSheets}
          storedSheetUrl={manager.storedSheetUrl}
          setShowPromoModal={manager.setShowPromoModal}
          setData={manager.setData}
          planSlug={manager.planSlug}
        />

        <BulkEditorTable
          data={manager.data}
          categories={manager.categories}
          updateData={manager.updateData}
          removeRow={manager.removeRow}
          setEditingRowIndex={manager.setEditingRowIndex}
          handleDragEnd={manager.handleDragEnd}
        />

        {/* --- Tips/Footer --- */}
        <div className="flex items-center gap-4 text-xs text-[var(--dash-text-muted)]">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] font-sans">Tab</kbd>
            <span>Navegar</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] font-sans">Enter</kbd>
            <span>Confirmar</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Alterações locais não salvas</span>
          </div>
        </div>

        {/* --- No Category Modal --- */}
        <AnimatePresence>
          {manager.showNoCategoryModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md overflow-hidden rounded-[27px] border shadow-2xl"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <div className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[27px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                    Categoria Necessária
                  </h3>
                  <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                    Para realizar o cadastro em massa, você precisa ter pelo menos uma categoria cadastrada.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        window.location.href = "/dashboard/catalogo";
                      }}
                      className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      Ir para Gestão de Categorias
                    </button>
                    <button
                      onClick={() => manager.setShowNoCategoryModal(false)}
                      className="w-full py-2 text-sm font-medium hover:underline"
                      style={{ color: "var(--dash-text-muted)" }}
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Detail Drawer */}
        <AnimatePresence>
          {manager.editingProduct && manager.editingRowIndex !== null && (
            <ProductDetailDrawer 
              product={manager.editingProduct}
              rowIndex={manager.editingRowIndex}
              categories={manager.categories}
              updateData={manager.updateData}
              onClose={() => manager.setEditingRowIndex(null)}
            />
          )}
        </AnimatePresence>

        {manager.orgId && manager.catalogId && (
          <BulkImportModal
            isOpen={manager.showImportModal}
            onClose={() => manager.setShowImportModal(false)}
            onSuccess={() => {
              manager.refreshData();
              manager.setShowImportModal(false);
            }}
            orgId={manager.orgId}
            catalogId={manager.catalogId}
            categories={manager.categories}
          />
        )}

        {manager.orgId && manager.catalogId && (
          <BulkPromoModal
            isOpen={manager.showPromoModal}
            onClose={() => manager.setShowPromoModal(false)}
            onSuccess={() => {
              manager.refreshData();
              manager.setShowPromoModal(false);
            }}
            catalogId={manager.catalogId}
            orgId={manager.orgId}
            categories={manager.categories}
            products={manager.data}
          />
        )}
      </div>
    </>
  );
}
