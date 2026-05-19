"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { trackAnalyticsEvent } from "@/lib/analytics";

type ProfileWhatsAppButtonProps = {
  profileId: string;
  slug: string;
  whatsapp: string;
  isAvailable?: boolean;
};

export default function ProfileWhatsAppButton({
  profileId,
  slug,
  whatsapp,
  isAvailable = true,
}: ProfileWhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  const [showWarning, setShowWarning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isAvailable) {
    return (
      <>
        <button 
          onClick={() => setShowWarning(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] px-4 py-3.5 text-[15px] font-bold text-white transition hover:brightness-95 shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg
            className="h-[22px] w-[22px] shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.435-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Falar no WhatsApp
        </button>

        {mounted && createPortal(
          <AnimatePresence>
            {showWarning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90"
                onClick={() => setShowWarning(false)}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative border border-[var(--public-card-border)] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl"
                  style={{ backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#18181b' : '#ffffff' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowWarning(false)}
                    className="absolute top-4 right-4 text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] p-2 rounded-full bg-[var(--public-status-bg)] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--public-text-main)] mb-2">
                    Consultor Indisponível
                  </h3>
                  <p className="text-sm text-[var(--public-text-dim)] mb-8 leading-relaxed">
                    Este consultor está temporariamente ausente. Sua mensagem será entregue, mas o tempo de resposta pode ser maior que o habitual.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        setShowWarning(false);
                        void trackAnalyticsEvent({
                          profileId,
                          eventType: "whatsapp_profile_click_delayed",
                          pageType: "profile",
                          metadata: { slug, path: `/${slug}` },
                        });
                      }}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20"
                    >
                      Continuar mesmo assim
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        void trackAnalyticsEvent({
          profileId,
          eventType: "whatsapp_profile_click",
          pageType: "profile",
          metadata: {
            slug,
            path: `/${slug}`,
          },
        });
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#25D366] px-4 py-3.5 text-[15px] font-bold text-white transition hover:brightness-95 shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 active:translate-y-0"
    >
      <svg
        className="h-[22px] w-[22px] shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.435-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
      Falar no WhatsApp
    </a>
  );
}