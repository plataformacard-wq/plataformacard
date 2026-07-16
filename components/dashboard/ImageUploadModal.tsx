"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Upload, Check, ImageIcon, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCroppedImg } from "@/lib/utils/image";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (url: string) => void;
  aspectRatio?: number;
  bucket?: string;
  folder?: string;
  title?: string;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  aspectRatio = 1,
  bucket = "avatars",
  folder = "uploads",
  title = "Upload de Imagem"
}: ImageUploadModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      
      // 1. Crop
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Falha no recorte");

      const imageFile = new File([croppedBlob], "image.webp", { type: "image/webp" });

      // 2. Compress
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp"
      };
      
      const compressedFile = await imageCompression(imageFile, options);

      // 3. Upload to Supabase via Server Action to bypass restrictive RLS
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("bucket", bucket);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // O fileName agora pode ter qualquer profundidade!
      const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      formData.append("path", fileName);

      const { uploadStorageFile } = await import("@/lib/dashboard/sellerActions");
      const result = await uploadStorageFile(formData);

      if (result.error || !result.publicUrl) {
        throw new Error(result.error || "Erro no upload");
      }

      onUploadSuccess(result.publicUrl);
      handleReset();
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Ocorreu um erro ao processar a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setZoom(1);
    setIsUploading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-[var(--dash-surface)]/5 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            {!image ? (
              // Step 1: Select File
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group relative flex flex-col items-center justify-center rounded-[27px] border-2 border-dashed border-white/10 bg-[var(--dash-surface)]/5 px-6 py-12 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[27px] bg-[var(--dash-surface)]/5 text-zinc-400 transition-colors group-hover:bg-emerald-500/20 group-hover:text-emerald-400">
                  <Upload size={28} />
                </div>
                <p className="text-lg font-bold text-white">Clique ou arraste uma foto</p>
                <p className="mt-2 text-sm text-zinc-500">JPG, PNG ou WebP (Máx. 5MB)</p>
              </motion.div>
            ) : (
              // Step 2: Crop
              <div className="space-y-6">
                <div className="relative h-80 w-full overflow-hidden rounded-[27px] bg-zinc-950">
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-4 px-2">
                  <ZoomOut size={16} className="text-zinc-500" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--dash-surface)]/10 accent-emerald-500"
                  />
                  <ZoomIn size={16} className="text-zinc-500" />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    disabled={isUploading}
                    className="flex-1 rounded-[27px] border border-white/10 bg-[var(--dash-surface)]/5 py-4 text-sm font-bold text-zinc-400 transition-all hover:bg-[var(--dash-surface)]/10 hover:text-white disabled:opacity-50"
                  >
                    Trocar Imagem
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-[27px] bg-emerald-500 py-4 text-sm font-black text-[var(--dash-text-primary)] transition-all hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-black" />
                    ) : (
                      <>
                        <Check size={18} /> Confirmar e Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer / Tip */}
          <div className="bg-[var(--dash-surface)]/5 px-8 py-4 text-center">
            <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <ImageIcon size={12} /> Dica: Use imagens com boa iluminação
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
