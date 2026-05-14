"use client";

import { Share2 } from "lucide-react";

interface PublicShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PublicShareButton({ title, text, url, className, style }: PublicShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Erro ao compartilhar:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copiado para a área de transferência!");
      } catch (err) {
        console.error("Erro ao copiar link:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={className}
      style={style}
    >
      <Share2 size={16} />
      Compartilhar Perfil
    </button>
  );
}
