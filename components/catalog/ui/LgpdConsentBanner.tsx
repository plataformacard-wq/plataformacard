"use client";

import { useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import Link from "next/link";

interface LgpdConsentBannerProps {
  primaryColor: string;
  isEmbed?: boolean;
}

export function LgpdConsentBanner({ primaryColor, isEmbed = false }: LgpdConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Evita executar no SSR e verifica o consentimento salvo
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("plataformashop-lgpd-consent");
      if (!consent) {
        // Se for a primeira visita, aguarda 1.5s para exibir o banner com transição sutil
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("plataformashop-lgpd-consent", "accepted");
      
      // Gera o VISITOR_ID caso não exista
      if (!localStorage.getItem("VISITOR_ID")) {
        const newVisitorId = typeof crypto !== "undefined" && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("VISITOR_ID", newVisitorId);
      }
      
      setIsVisible(false);
    }
  };

  const handleReject = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("plataformashop-lgpd-consent", "rejected");
      // Garante a remoção de qualquer identificador pré-existente
      localStorage.removeItem("VISITOR_ID");
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`z-[9999] bg-zinc-950/85 dark:bg-zinc-950/90 border border-white/10 text-white rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center md:items-start gap-4 max-w-2xl ${
            isEmbed 
              ? "sticky bottom-4 mx-4" 
              : "fixed bottom-6 left-6 right-6 md:left-auto md:right-6"
          }`}
          style={{
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5), inset 0 1px 0 0 rgb(255 255 255 / 0.05)"
          }}
        >
          {/* Icon */}
          <div className="shrink-0 h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-3 text-center md:text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-zinc-100">
                Privacidade e Cookies (LGPD)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nós usamos cookies e tecnologias semelhantes para melhorar sua experiência e gerar estatísticas de visitas anônimas. Ao continuar navegando, você concorda com a nossa{" "}
                <Link 
                  href="/privacidade" 
                  target="_blank"
                  className="text-emerald-400 hover:underline hover:text-emerald-300 font-bold transition-all"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-1">
              <button
                onClick={handleAccept}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-950 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                  color: "#09090b" // bg-zinc-950
                }}
              >
                Aceitar
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-400 border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Recusar
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleReject}
            className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
