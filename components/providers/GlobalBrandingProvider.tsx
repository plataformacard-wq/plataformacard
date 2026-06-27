"use client";
import React, { createContext, useContext } from "react";

interface GlobalBrandingContextType {
  globalLogoUrl: string | null;
  globalIconUrl: string | null;
  primaryColorLight: string;
  primaryColorDark: string;
}

const GlobalBrandingContext = createContext<GlobalBrandingContextType>({
  globalLogoUrl: null,
  globalIconUrl: null,
  primaryColorLight: "#10b981",
  primaryColorDark: "#25D366",
});

export const useGlobalBranding = () => useContext(GlobalBrandingContext);

export default function GlobalBrandingProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: {
    globalLogoUrl: string | null;
    globalIconUrl: string | null;
    primaryColorLight: string;
    primaryColorDark: string;
  };
}) {
  return (
    <GlobalBrandingContext.Provider value={config}>
      {children}
    </GlobalBrandingContext.Provider>
  );
}
