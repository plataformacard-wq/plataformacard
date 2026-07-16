"use client";

import { useState, useEffect } from "react";
import { X, Bell, Zap, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalAlertProps {
  noticeId: string;
  noticeText: string;
  isActive: boolean;
}

export default function GlobalAlert({ noticeId, noticeText, isActive }: GlobalAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive && noticeText) {
      const dismissedId = localStorage.getItem("DISMISSED_NOTICE_ID");
      if (dismissedId !== noticeId) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [noticeId, noticeText, isActive]);

  const handleDismiss = () => {
    localStorage.setItem("DISMISSED_NOTICE_ID", noticeId);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-[100] w-full"
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-3 text-white shadow-lg">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-surface)]/20 backdrop-blur-md">
                  <Zap size={18} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Aviso do Sistema</span>
                  <p className="text-sm font-bold leading-tight">{noticeText}</p>
                </div>
              </div>
              
              <button 
                onClick={handleDismiss}
                className="rounded-lg p-1.5 hover:bg-[var(--dash-surface)]/20 transition-colors"
                title="Fechar aviso"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
