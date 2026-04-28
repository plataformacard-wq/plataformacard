"use client";

import React, { useState, useCallback, useRef } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  Crop, 
  Check, 
  Image as ImageIcon, 
  AlertCircle, 
  Info,
  Maximize2,
  Minus,
  Plus
} from "lucide-react";
import { getCroppedImg, compressImage, validateImageResolution, createImage } from "@/lib/image-utils";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File, previewUrl: string) => void;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  maxFiles?: number;
  initialFile?: File | null;
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  onConfirm,
  aspectRatio = 1,
  minWidth = 600,
  minHeight = 600,
  initialFile = null,
}: ImageEditorModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_area: Area, AreaPixels: Area) => {
    setCroppedAreaPixels(AreaPixels);
  }, []);

  // Carregar arquivo inicial se fornecido
  React.useEffect(() => {
    if (initialFile && isOpen) {
      processFile(initialFile);
    }
  }, [initialFile, isOpen]);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      const src = reader.result?.toString() || null;
      if (src) {
        try {
          const img = await createImage(src);
          if (img.width < minWidth || img.height < minHeight) {
            setError(`A imagem é muito pequena (${img.width}x${img.height}). O tamanho mínimo é ${minWidth}x${minHeight}px.`);
            return;
          }
          setImageSrc(src);
          setError(null);
        } catch (err) {
          setError("Erro ao processar imagem.");
        }
      }
    });
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      setError(null);

      // 1. Get cropped image as blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Falha ao recortar imagem.");

      // 2. Compress image
      const fileName = `product-${Date.now()}.jpg`;
      const compressedFile = await compressImage(croppedBlob, fileName);

      // 3. Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);

      onConfirm(compressedFile, previewUrl);
      resetAndClose();
    } catch (err) {
      console.error(err);
      setError("Erro ao processar imagem. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border shadow-2xl"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6" style={{ borderColor: "var(--dash-border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Crop size={20} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>
                Editar Imagem
              </h3>
            </div>
            <button
              onClick={resetAndClose}
              className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--dash-text-muted)" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">
            {!imageSrc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-12 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
                style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface-secondary)" }}
              >
                <div className="mb-4 rounded-2xl p-5 shadow-sm transition-transform group-hover:scale-110" style={{ background: "var(--dash-surface)" }}>
                  <Upload className="text-emerald-500" size={32} />
                </div>
                <p className="mb-1 font-bold" style={{ color: "var(--dash-text-primary)" }}>
                  Clique para selecionar ou arraste a imagem
                </p>
                <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>
                  JPG, PNG ou WebP (Mín. {minWidth}x{minHeight}px)
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cropper Container */}
                <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-black">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 px-2">
                  <Minus size={16} className="text-zinc-500" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/5 dark:bg-white/10 accent-emerald-500 border border-black/5 dark:border-white/5"
                  />
                  <Plus size={16} className="text-zinc-500" />
                  <button 
                    onClick={() => setZoom(1)}
                    className="ml-2 text-xs font-bold text-zinc-500 hover:text-emerald-500"
                  >
                    RESETAR
                  </button>
                </div>

                {/* Instructions */}
                <div className="rounded-2xl p-5 border" style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}>
                  <div className="flex gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Info className="text-emerald-500" size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                        Dicas para uma imagem premium:
                      </p>
                      <ul className="list-inside list-disc text-xs space-y-1" style={{ color: "var(--dash-text-muted)" }}>
                        <li>Fundos claros (branco ou cinza) valorizam o produto.</li>
                        <li>Centralize bem o item principal no enquadramento.</li>
                        <li>Imagens serão otimizadas automaticamente para carregamento rápido.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 text-sm font-bold text-red-400">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t p-6" style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}>
            <button
              onClick={resetAndClose}
              disabled={isProcessing}
              className="rounded-xl px-6 py-3 text-sm font-bold transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
              style={{ color: "var(--dash-text-muted)" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!imageSrc || isProcessing}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-500 disabled:opacity-50 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processando...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Confirmar e Salvar
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
