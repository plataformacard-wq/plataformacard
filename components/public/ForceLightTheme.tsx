"use client";
import { useEffect } from "react";
export default function ForceLightTheme() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);
  return null;
}
