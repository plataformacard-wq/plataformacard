import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, List, Palette, Tag, X, Plus as PlusIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { ProductRow } from "../ProductDetailDrawer";

interface DrawerDisplaySettingsProps {
  product: ProductRow;
  updateData: (index: number, id: string, value: any) => void;
  rowIndex: number;
  effectiveShowSpecs: boolean;
  effectiveShowColors: boolean;
  colors: string[];
  setColors: (colors: string[]) => void;
  editingColorIdx: number | null;
  setEditingColorIdx: (idx: number | null) => void;
  colorPickerValue: string;
  setColorPickerValue: (color: string) => void;
  isPickerOpen: boolean;
  setIsPickerOpen: (isOpen: boolean) => void;
  addColor: (hex: string) => void;
}

export default function DrawerDisplaySettings({
  product,
  updateData,
  rowIndex,
  effectiveShowSpecs,
  effectiveShowColors,
  colors,
  setColors,
  editingColorIdx,
  setEditingColorIdx,
  colorPickerValue,
  setColorPickerValue,
  isPickerOpen,
  setIsPickerOpen,
  addColor,
}: DrawerDisplaySettingsProps) {
  return (
    <section className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Settings size={16} /> Configurações de Exibição
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
          <div className="flex items-center gap-2">
            <List size={18} className="text-[var(--dash-text-muted)]" />
            <span className="text-sm font-medium">Especificações</span>
          </div>
          <button 
            onClick={() => updateData(rowIndex, "show_specs", !effectiveShowSpecs)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${effectiveShowSpecs ? 'bg-primary' : 'bg-zinc-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${effectiveShowSpecs ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-[var(--dash-text-muted)]" />
            <span className="text-sm font-medium">Cores do Produto</span>
          </div>
          <button 
            onClick={() => updateData(rowIndex, "show_colors", !effectiveShowColors)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${effectiveShowColors ? 'bg-primary' : 'bg-zinc-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${effectiveShowColors ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4 p-5 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-emerald-500" />
              <span className="text-sm font-black uppercase tracking-tight">Destaque do Produto</span>
            </div>
            <button 
              onClick={() => updateData(rowIndex, "show_highlight", !product.show_highlight)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${product.show_highlight ? 'bg-emerald-500' : 'bg-zinc-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${product.show_highlight ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {product.show_highlight && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <input 
                value={product.highlight_text || ""}
                onChange={(e) => updateData(rowIndex, "highlight_text", e.target.value)}
                placeholder="Ex: Produto Exclusivo, Sem CNH..."
                className="w-full p-3 bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </motion.div>
          )}
        </div>
      </div>

      {effectiveShowColors && (
        <div className="p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
              <Palette size={14} /> Adicione suas cores
            </label>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
              {colors.length}/4 CORES
            </span>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            {colors.map((color, idx) => (
              <div key={idx} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    setEditingColorIdx(idx);
                    setColorPickerValue(color);
                    setIsPickerOpen(true);
                  }}
                  className={`h-14 w-14 rounded-xl border-4 shadow-xl transition-all hover:scale-105 active:scale-95 ${editingColorIdx === idx ? 'border-primary ring-4 ring-primary/20' : 'border-white'}`}
                  style={{ backgroundColor: color }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    const newColors = colors.filter((_, i) => i !== idx);
                    setColors(newColors);
                    updateData(rowIndex, "colors", newColors);
                    if (editingColorIdx === idx) {
                      setEditingColorIdx(null);
                      setIsPickerOpen(false);
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 z-10"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            <div className="relative">
              <button 
                type="button"
                onClick={() => {
                  if (colors.length < 4) {
                    setEditingColorIdx(null);
                    setColorPickerValue("#000000");
                    setIsPickerOpen(!isPickerOpen);
                  }
                }}
                className="h-14 w-14 rounded-xl border-4 border-white shadow-xl overflow-hidden hover:scale-105 active:scale-95 transition-all relative"
                style={{ background: "linear-gradient(to bottom, #ff0000 0%, #ff00ff 17%, #0000ff 33%, #00ffff 50%, #00ff00 67%, #ffff00 83%, #ff0000 100%)" }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-transparent transition-colors">
                  <PlusIcon size={18} className="text-white drop-shadow-md" />
                </div>
              </button>

              <AnimatePresence>
                {isPickerOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsPickerOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 bottom-full mb-4 z-[70] p-6 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] border min-w-[280px]"
                      style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                    >
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>
                            {editingColorIdx !== null ? "Ajustar Cor" : "Nova Escolha"}
                          </span>
                          <button onClick={() => setIsPickerOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-[var(--dash-surface)]/5 rounded-full transition-colors">
                            <X size={14} style={{ color: "var(--dash-text-muted)" }} />
                          </button>
                        </div>

                        <div className="premium-picker-wrapper">
                          <HexColorPicker color={colorPickerValue} onChange={setColorPickerValue} />
                        </div>

                        <div className="space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Sugestões</p>
                          <div className="flex flex-wrap gap-2">
                            {['#FF0000', '#0000FF', '#FFFF00', '#000000', '#FFFFFF', '#008000', '#808080', '#FFA500'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setColorPickerValue(preset);
                                }}
                                className="h-7 w-7 rounded-lg border shadow-sm hover:scale-110 transition-transform active:scale-90"
                                style={{ backgroundColor: preset, borderColor: "var(--dash-border)" }}
                                title={preset}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}>
                          <div className="h-10 w-10 rounded-xl border shadow-inner shrink-0" style={{ backgroundColor: colorPickerValue, borderColor: "var(--dash-border)" }} />
                          <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--dash-text-muted)" }}>[Cor Personalizada]</p>
                            <p className="text-xs font-mono font-bold" style={{ color: "var(--dash-text-primary)" }}>{colorPickerValue.toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsPickerOpen(false);
                              setEditingColorIdx(null);
                            }}
                            className="px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border"
                            style={{ background: "var(--dash-surface-secondary)", color: "var(--dash-text-muted)", borderColor: "var(--dash-border)" }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              addColor(colorPickerValue);
                              setIsPickerOpen(false);
                            }}
                            className="px-4 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 border-none"
                          >
                            {editingColorIdx !== null ? "Atualizar" : "Confirmar"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
