"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, ShieldCheck, Loader2, AlertTriangle, X, Check } from "lucide-react";
import { registerPasskey } from "@/lib/auth/passkey-helpers";

type PasskeyEnrollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSuccess: () => void;
};

export default function PasskeyEnrollModal({ isOpen, onClose, userName, onSuccess }: PasskeyEnrollModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successState, setSuccessState] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await registerPasskey(userName || "Lojista");

      if (!res.success) {
        throw new Error(res.error || "Não foi possível registrar a biometria.");
      }

      setSuccessState(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Falha no leitor biométrico.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-[27px] border p-6 shadow-2xl relative transition-colors text-center"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors text-[var(--dash-text-muted)]"
        >
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          {successState ? <Check size={32} /> : <Fingerprint size={36} />}
        </div>

        <h3 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>
          {successState ? "Digital Cadastrada!" : "Cadastrar Digital / Face ID"}
        </h3>
        <p className="text-xs text-[var(--dash-text-muted)] mt-1 leading-relaxed">
          {successState
            ? "Você já pode acessar sua conta neste dispositivo apenas com um toque."
            : "Use o leitor biométrico do seu celular ou computador para acessar o painel de forma instantânea e ultra-segura."}
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-center justify-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!successState && (
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Toque na Digital no Celular...
                </>
              ) : (
                <>
                  <Fingerprint size={18} />
                  Ativar Biometria Agora
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-[var(--dash-text-muted)] hover:text-primary transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
