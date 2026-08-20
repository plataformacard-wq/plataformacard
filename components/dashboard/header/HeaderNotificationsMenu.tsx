"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, MessageCircle, Package, Clock } from "lucide-react";

interface HeaderNotificationsMenuProps {
  notifications?: any[];
}

export function HeaderNotificationsMenu({ notifications = [] }: HeaderNotificationsMenuProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [lastReadTime, setLastReadTime] = useState(0);

  useEffect(() => {
    const savedTime = localStorage.getItem("last_read_bell_time");
    if (savedTime) setLastReadTime(parseInt(savedTime, 10));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = notifications.some(
    (n) => new Date(n.created_at).getTime() > lastReadTime
  );

  const handleOpenNotifications = () => {
    const nextState = !isNotificationsOpen;
    setIsNotificationsOpen(nextState);
    if (nextState && notifications.length > 0) {
      const latest = new Date(notifications[0].created_at).getTime();
      setLastReadTime(latest);
      localStorage.setItem("last_read_bell_time", latest.toString());
    }
  };

  return (
    <div ref={notificationsRef} className="relative">
      <button 
        onClick={handleOpenNotifications}
        className="relative rounded-lg p-2.5 text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-primary transition-all"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-[27px] p-0 shadow-2xl overflow-hidden z-[100] border border-[var(--dash-border)] bg-[var(--dash-surface)]"
          >
            <div className="px-4 py-3 border-b border-[var(--dash-border)]/50 flex items-center justify-between">
              <p className="text-sm font-bold text-[var(--dash-text-primary)]">Notificações</p>
              <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--dash-hover-bg)] px-2 py-0.5 rounded-full text-[var(--dash-text-muted)]">
                {notifications.length} recentes
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-[var(--dash-text-muted)] text-xs flex flex-col items-center gap-2">
                  <Bell size={24} className="opacity-20" />
                  <p>Nenhuma notificação por enquanto.</p>
                </div>
              ) : (
                notifications.map((n, idx) => {
                  const isLead = n.notification_type === 'new_lead';
                  const isUpdate = n.notification_type === 'catalog_update';
                  const dateStr = new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

                  return (
                    <div key={idx} className="flex gap-3 px-4 py-3 hover:bg-[var(--dash-hover-bg)] transition-colors border-b border-[var(--dash-border)]/30 last:border-0 cursor-pointer">
                      <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                        isLead ? "bg-emerald-500/10 text-emerald-500" : 
                        isUpdate ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {isLead ? <MessageCircle size={14} /> : isUpdate ? <Package size={14} /> : <Bell size={14} />}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--dash-text-primary)] truncate">
                          {isLead ? `Novo Lead para ${n.product_name}` : 
                           isUpdate ? `${n.action_type === 'INSERT' ? 'Novo Produto' : n.action_type === 'UPDATE' ? 'Produto Atualizado' : 'Produto Removido'} (${n.catalog_name})` : 
                           n.product_name || "Aviso do Sistema"}
                        </p>
                        <p className="text-[10px] text-[var(--dash-text-muted)] mt-0.5 truncate leading-tight">
                          {isLead ? `Vendedor: ${n.seller_name}` : 
                           isUpdate ? n.product_name : 
                           "Confira mais detalhes no sistema"}
                        </p>
                        <p className="text-[9px] text-[var(--dash-text-muted)] font-medium mt-1 flex items-center gap-1 opacity-70">
                          <Clock size={10} /> {dateStr}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
