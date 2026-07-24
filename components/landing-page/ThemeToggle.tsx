"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Verifica a preferência salva ou inicia como escuro por padrão
    const savedTheme = (localStorage.getItem("ps_theme") || localStorage.getItem("dash-theme")) as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function applyTheme(newTheme: "light" | "dark") {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("ps_theme", newTheme);
    localStorage.setItem("dash-theme", newTheme);
    window.dispatchEvent(new Event("ps_theme_changed"));
  }

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-white/20 transition-all text-xs font-bold shadow-sm"
      title={`Alternar para modo ${theme === "light" ? "escuro" : "claro"}`}
    >
      {theme === "light" ? (
        <>
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Modo Escuro</span>
        </>
      )}
    </button>
  );
}
