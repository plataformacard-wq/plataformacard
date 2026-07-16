import React from "react";
import { Image as ImageIcon, PlusCircle, Loader2, X } from "lucide-react";
import { ProductRow } from "../ProductDetailDrawer";

interface DrawerImageGalleryProps {
  product: ProductRow;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, isGallery?: boolean) => void;
  removeGalleryImage: (url: string) => void;
  uploading: boolean;
}

export default function DrawerImageGallery({
  product,
  handleImageUpload,
  removeGalleryImage,
  uploading,
}: DrawerImageGalleryProps) {
  return (
    <section className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <ImageIcon size={16} /> Galeria de Imagens
      </h4>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Imagem Principal */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Imagem Principal</label>
          <div className="relative aspect-square rounded-lg border-2 border-dashed border-[var(--dash-border)] overflow-hidden flex items-center justify-center bg-[var(--dash-hover-bg)] group">
            {product.image_url ? (
              <>
                <img src={product.image_url} alt="Principal" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer p-2 bg-[var(--dash-surface)] rounded-full text-[var(--dash-text-primary)] hover:scale-110 transition-transform">
                    <PlusCircle size={20} />
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e)} disabled={uploading} />
                  </label>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center gap-2 cursor-pointer p-4 text-center">
                <ImageIcon size={32} className="text-[var(--dash-text-muted)]" />
                <span className="text-xs text-[var(--dash-text-muted)]">Subir Capa</span>
                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e)} disabled={uploading} />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-[var(--dash-surface)]/80 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Galeria Extra */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fotos Extras ({Array.isArray(product.image_urls) ? product.image_urls.length : (typeof product.image_urls === 'string' && product.image_urls.startsWith('[') ? JSON.parse(product.image_urls).length : 0)})</label>
          <div className="grid grid-cols-2 gap-2">
            {(() => {
              let urls = product.image_urls;
              if (typeof urls === 'string') {
                try { urls = JSON.parse(urls); } catch(e) { urls = []; }
              }
              if (!Array.isArray(urls)) urls = [];
              return urls.map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url} alt="Extra" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeGalleryImage(url)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ));
            })()}
            <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--dash-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--dash-hover-bg)] transition-colors">
              <PlusCircle size={20} className="text-[var(--dash-text-muted)]" />
              <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
