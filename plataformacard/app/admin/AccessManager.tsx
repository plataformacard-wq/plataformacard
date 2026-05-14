"use client";

import { useState } from "react";
import { updateInviteCode } from "@/lib/admin-actions";

interface AccessManagerProps {
  currentCode: string;
}

export default function AccessManager({ currentCode }: AccessManagerProps) {
  const [code, setCode] = useState(currentCode);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!code) return;
    
    setLoading(true);
    setMessage("");
    
    const result = await updateInviteCode(code);
    
    if (result.success) {
      setMessage("✅ Código atualizado com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Erro ao salvar.");
    }
    
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border p-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--dash-text-primary)" }}>
        Gestão de Acesso Beta
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: "var(--dash-text-secondary)" }}>
            Código de Convite Atual
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EX: MAJ2024"
              className="flex-1 rounded-xl border bg-transparent px-4 py-2 text-sm outline-none focus:border-blue-500"
              style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            />
            <button
              onClick={handleSave}
              disabled={loading || code === currentCode}
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
          {message && (
            <p className="mt-2 text-xs font-medium" style={{ color: message.includes("✅") ? "#10b981" : "#ef4444" }}>
              {message}
            </p>
          )}
        </div>
        
        <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>
          * Este código é exigido na tela de cadastro. Mude-o para invalidar convites antigos ou criar novas campanhas.
        </p>
      </div>
    </div>
  );
}
