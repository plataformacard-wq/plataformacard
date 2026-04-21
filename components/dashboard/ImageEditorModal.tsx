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
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  onConfirm,
  aspectRatio = 1,
  minWidth = 600,
  minHeight = 600,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      const src = reader.result?.toString() || null;
      if (src) {
        // Validar resolução mínima antes de abrir o crop
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
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Crop size={18} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white">
                Editar Imagem
              </h3>
            </div>
            <button
              onClick={resetAndClose}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {!imageSrc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 transition-all hover:border-emerald-500 hover:bg-emerald-50/30 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-emerald-500/50"
              >
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm transition-transform group-hover:scale-110 dark:bg-slate-700">
                  <Upload className="text-emerald-500" size={32} />
                </div>
                <p className="mb-1 font-medium text-slate-700 dark:text-slate-200">
                  Clique para selecionar ou arraste a imagem
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                <div className="relative h-80 w-full overflow-hidden rounded-xl bg-slate-950">
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
                  <Minus size={16} className="text-slate-400" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-500 dark:bg-slate-700"
                  />
                  <Plus size={16} className="text-slate-400" />
                  <button 
                    onClick={() => setZoom(1)}
                    className="ml-2 text-xs font-medium text-slate-500 hover:text-emerald-500"
                  >
                    Resetar
                  </button>
                </div>

                {/* Instructions */}
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="flex gap-3">
                    <Info className="shrink-0 text-emerald-500" size={20} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Dicas para uma imagem premium:
                      </p>
                      <ul className="list-inside list-disc text-xs text-slate-500 dark:text-slate-400">
                        <li>Fundos claros (branco ou cinza) valorizam o produto.</li>
                        <li>Centralize bem o item principal no enquadramento.</li>
                        <li>Evite sombras fortes ou imagens desfocadas.</li>
                        <li>Imagens serão otimizadas automaticamente para carregamento rápido.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <button
              onClick={resetAndClose}
              disabled={isProcessing}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!imageSrc || isProcessing}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/40 disabled:opacity-50 active:scale-95"
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
