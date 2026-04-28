"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function PublicThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("dash-theme");
    if (saved === "light") {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }, []);

  if (!mounted) return null;

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("dash-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("dash-theme", "light");
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 h-10 w-10 rounded-full flex items-center justify-center glass hover:scale-105 transition-all text-foreground"
      aria-label="Toggle Theme"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
