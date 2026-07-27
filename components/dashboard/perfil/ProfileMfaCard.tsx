"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Fingerprint, Lock, Smartphone, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { getMfaStatus, disableMfaForUser, MfaStatusResult } from "@/lib/auth/mfaActions";
import { isPasskeySupported } from "@/lib/auth/passkey-helpers";
import MfaEnrollModal from "./MfaEnrollModal";
import PasskeyEnrollModal from "./PasskeyEnrollModal";

export default function ProfileMfaCard({ userEmail }: { userEmail: string }) {
  const [mfaStatus, setMfaStatus] = useState<MfaStatusResult | null>(null);
  const [passkeySupported, setPasskeySupported] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState<boolean>(false);
  const [disabling, setDisabling] = useState<boolean>(false);

  useEffect(() => {
    loadStatus();
    checkPasskeySupport();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await getMfaStatus();
      setMfaStatus(res);
    } catch (err) {
      console.error("Erro ao carregar status 2FA:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPasskeySupport = async () => {
    const supported = await isPasskeySupported();
    setPasskeySupported(supported);
  };

  const handleDisable2Fa = async () => {
    if (!confirm("Tem certeza que deseja desativar a Autenticação de Dois Fatores (2FA)? Sua conta ficará menos protegida.")) return;
    setDisabling(true);
    try {
      await disableMfaForUser();
      await loadStatus();
    } catch (err) {
      console.error("Erro ao desativar 2FA:", err);
    } finally {
      setDisabling(false);
    }
  };

  return (
    <>
      <div
        className="rounded-[27px] border p-6 shadow-sm transition-colors relative overflow-hidden"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
            <ShieldCheck size={18} className="text-primary" /> Autenticação em Dois Fatores (2FA / Biometria)
          </h2>
          <button
            type="button"
            onClick={loadStatus}
            title="Atualizar status"
            className="p-1.5 rounded-lg hover:bg-black/5 text-[var(--dash-text-muted)] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
          Proteja sua loja contra invasões exigindo um segundo fator de verificação (App Autenticador ou Biometria Nativa).
        </p>

        {loading ? (
          <div className="mt-6 p-4 rounded-lg border bg-black/5 dark:bg-[var(--dash-surface)]/5 animate-pulse text-xs text-[var(--dash-text-muted)] text-center">
            Verificando status de segurança da conta...
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Status Geral */}
            <div
              className={`flex items-center justify-between p-4 rounded-[27px] border ${
                mfaStatus?.isEnabled
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {mfaStatus?.isEnabled ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                <div>
                  <p className="text-sm font-bold">
                    {mfaStatus?.isEnabled ? "2FA Ativo e Protegido" : "2FA Desativado (Recomendado Ativar)"}
                  </p>
                  <p className="text-xs opacity-90 mt-0.5">
                    {mfaStatus?.isEnabled
                      ? "Sua conta está protegida por camada dupla de segurança."
                      : "Ative para proteger saques, dados de clientes e alterar senhas com segurança."}
                  </p>
                </div>
              </div>

              {mfaStatus?.isEnabled && (
                <button
                  type="button"
                  onClick={handleDisable2Fa}
                  disabled={disabling}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-all shrink-0"
                >
                  {disabling ? "Desativando..." : "Desativar"}
                </button>
              )}
            </div>

            {/* Ações de Configuração */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Botão App Autenticador */}
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(true)}
                className="p-4 rounded-[27px] border text-left hover:border-primary/50 transition-all group flex items-start gap-3"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Smartphone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>
                    App Autenticador (TOTP)
                  </p>
                  <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">
                    Google Authenticator, Authy ou 1Password.
                  </p>
                </div>
              </button>

              {/* Botão Biometria / Touch ID */}
              <button
                type="button"
                onClick={() => setIsPasskeyModalOpen(true)}
                disabled={!passkeySupported}
                className="p-4 rounded-[27px] border text-left hover:border-emerald-500/50 transition-all group flex items-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Fingerprint size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>
                    Digital / Face ID (Passkey)
                  </p>
                  <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">
                    {passkeySupported ? "Entrar com toque no leitor do celular." : "Não disponível neste navegador."}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <MfaEnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onSuccess={() => {
          loadStatus();
        }}
      />

      <PasskeyEnrollModal
        isOpen={isPasskeyModalOpen}
        onClose={() => setIsPasskeyModalOpen(false)}
        userName={userEmail}
        onSuccess={() => {
          loadStatus();
        }}
      />
    </>
  );
}
