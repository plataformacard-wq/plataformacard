"use client";

import { useEffect, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";

interface CatalogBadgeProps {
  catalogId: string;
  latestProductTimestamp: string | null;
  children: React.ReactNode;
}

export default function CatalogBadge({ catalogId, latestProductTimestamp, children }: CatalogBadgeProps) {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    if (!latestProductTimestamp || !catalogId) return;

    const lastSeen = localStorage.getItem(`last_catalog_view_${catalogId}`);
    
    if (!lastSeen) {
      setHasUpdate(true);
      return;
    }

    const lastSeenTime = new Date(lastSeen).getTime();
    const latestUpdateTime = new Date(latestProductTimestamp).getTime();

    if (latestUpdateTime > lastSeenTime) {
      setHasUpdate(true);
    }
  }, [catalogId, latestProductTimestamp]);

  const handleClick = () => {
    // We update the timestamp when the user clicks to enter the catalog
    // But we also update it inside the catalog page to be sure
    localStorage.setItem(`last_catalog_view_${catalogId}`, new Date().toISOString());
    setHasUpdate(false);
  };

  return (
    <div className="relative w-full" onClick={handleClick}>
      {children}
      <AnimatePresence>
        {hasUpdate && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 border-2 border-black text-[10px] font-bold text-white shadow-lg pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
