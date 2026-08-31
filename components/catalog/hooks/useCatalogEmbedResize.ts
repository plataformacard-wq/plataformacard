import { useState, useEffect } from "react";

interface UseCatalogEmbedResizeProps {
  isEmbed?: boolean;
}

export function useCatalogEmbedResize({ isEmbed }: UseCatalogEmbedResizeProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Auto-Height for Embed Mode (CaaS) - TRAVA DE SEGURANÇA
    if (isEmbed) {
      let lastHeight = 0;
      let timeoutId: any = null;

      const getTargetHeight = () => {
        const target = document.getElementById("catalog-content-wrapper");
        return target
          ? target.offsetHeight
          : document.documentElement.offsetHeight || document.body.scrollHeight;
      };

      const sendHeight = () => {
        if (timeoutId) return;

        timeoutId = setTimeout(() => {
          timeoutId = null;
          const height = getTargetHeight();
          // Só atualiza se a altura diferir por mais de 25px para evitar micro-ajustes gerados por scrollbars e loops de reflow
          if (Math.abs(height - lastHeight) > 25) {
            lastHeight = height;
            window.parent.postMessage({ type: "plataformashop-height", height }, "*");
          }
        }, 150); // 150ms de throttle para dar estabilidade ao layout
      };

      // Envia a altura inicial e monitora mudanças de tamanho do content-wrapper
      const targetElement = document.getElementById("catalog-content-wrapper") || document.body;
      const observer = new ResizeObserver(() => sendHeight());
      observer.observe(targetElement);

      // Também monitora o carregamento de imagens (que mudam a altura após o render inicial)
      window.addEventListener("load", sendHeight);

      // Envio inicial imediato
      const initialHeight = getTargetHeight();
      lastHeight = initialHeight;
      window.parent.postMessage({ type: "plataformashop-height", height: initialHeight }, "*");

      return () => {
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
        window.removeEventListener("load", sendHeight);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isEmbed]);

  return {
    hasMounted,
    isMobile,
  };
}
