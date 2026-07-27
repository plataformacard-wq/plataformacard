"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Fingerprint, Mail, Key, Loader2, AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { verifyBackupCode, sendEmailMfaCode, verifyEmailMfaCode } from "@/lib/auth/mfaActions";
import { isPasskeySupported, authenticatePasskey } from "@/lib/auth/passkey-helpers";

type MfaChallengeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
};

export default function MfaChallengeModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Verificação de Segurança (2FA)",
  description = "Por razões de segurança, confirme sua identidade para prosseguir.",
}: MfaChallengeModalProps) {
  const [method, setMethod] = useState<"totp" | "passkey" | "email" | "backup">("totp");
  const [code, setCode] = useState<string>("");
  const [passkeyAvailable, setPasskeyAvailable] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      checkPasskeySupport();
    } else {
      setCode("");
      setErrorMsg("");
      setLoading(false);
      setEmailSent(false);
    }
  }, [isOpen]);

  const checkPasskeySupport = async () => {
    const supported = await isPasskeySupported();
    setPasskeyAvailable(supported);
    if (supported) {
      setMethod("passkey");
    }
  };

  const handleVerifyTotp = async () => {
    if (!code || code.length < 6) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.all?.find((f) => f.factor_type === "totp" && f.status === "verified");

      if (!totpFactor) {
        throw new Error("Nenhum app autenticador encontrado.");
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeError || !challengeData) {
        throw new Error(challengeError?.message || "Erro ao solicitar desafio 2FA.");
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        throw new Error("Código 2FA incorreto ou expirado.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao verificar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasskey = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const res = await authenticatePasskey(user?.email || "Lojista");
      if (!res.success) {
        throw new Error(res.error || "Falha na leitura biométrica.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro na verificação por digital.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await sendEmailMfaCode();
      if (!res.success) {
        throw new Error(res.error || "Erro ao enviar e-mail.");
      }
      setEmailSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Não foi possível enviar o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!code || code.length < 6) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyEmailMfaCode(code);
      if (!res.success) {
        throw new Error(res.error || "Código de e-mail inválido.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao validar e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackup = async () => {
    if (!code) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyBackupCode(code);
      if (!res.success) {
        throw new Error(res.error || "Código de backup inválido.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro no código de backup.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-[27px] border p-6 shadow-2xl relative transition-colors"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors text-[var(--dash-text-muted)]"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--dash-text-primary)" }}>
              {title}
            </h3>
            <p className="text-xs text-[var(--dash-text-muted)]">{description}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Seletor de Métodos */}
          <div className="flex rounded-lg border p-1 gap-1" style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}>
            {passkeyAvailable && (
              <button
                type="button"
                onClick={() => { setMethod("passkey"); setCode(""); setErrorMsg(""); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  method === "passkey" ? "bg-emerald-500 text-white shadow-sm" : "text-[var(--dash-text-muted)] hover:text-primary"
                }`}
              >
                <Fingerprint size={14} /> Biometria
              </button>
            )}
            <button
              type="button"
              onClick={() => { setMethod("totp"); setCode(""); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                method === "totp" ? "bg-primary text-white shadow-sm" : "text-[var(--dash-text-muted)] hover:text-primary"
              }`}
            >
              <ShieldCheck size={14} /> App 2FA
            </button>
            <button
              type="button"
              onClick={() => { setMethod("email"); setCode(""); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                method === "email" ? "bg-primary text-white shadow-sm" : "text-[var(--dash-text-muted)] hover:text-primary"
              }`}
            >
              <Mail size={14} /> E-mail
            </button>
            <button
              type="button"
              onClick={() => { setMethod("backup"); setCode(""); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                method === "backup" ? "bg-primary text-white shadow-sm" : "text-[var(--dash-text-muted)] hover:text-primary"
              }`}
            >
              <Key size={14} /> Backup
            </button>
          </div>

          <AnimatePresence mode="wait">
            {method === "passkey" && (
              <motion.div key="passkey-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center space-y-3">
                <p className="text-xs text-[var(--dash-text-muted)]">Toque na digital do seu dispositivo para autenticar</p>
                <button
                  type="button"
                  onClick={handleVerifyPasskey}
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Fingerprint size={20} />}
                  Confirmar com Digital / Face ID
                </button>
              </motion.div>
            )}

            {method === "totp" && (
              <motion.div key="totp-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <label className="text-xs font-bold text-[var(--dash-text-muted)] block text-center">
                  Digite o código de 6 dígitos do Google Authenticator ou Authy
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-lg border p-3 text-center text-2xl font-mono tracking-widest outline-none"
                  style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
                <button
                  type="button"
                  onClick={handleVerifyTotp}
                  disabled={loading || code.length < 6}
                  className="w-full py-3 rounded-lg font-bold text-sm bg-primary text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Validar Código 2FA"}
                </button>
              </motion.div>
            )}

            {method === "email" && (
              <motion.div key="email-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {!emailSent ? (
                  <div className="text-center py-2 space-y-3">
                    <p className="text-xs text-[var(--dash-text-muted)]">Enviaremos um código temporário de verificação para o seu e-mail cadastrado.</p>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={loading}
                      className="w-full py-3 rounded-lg font-bold text-sm bg-primary text-white hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                      Enviar Código por E-mail
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="text-xs font-bold text-[var(--dash-text-muted)] block text-center">
                      Insira o código de 6 dígitos recebido no e-mail
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full rounded-lg border p-3 text-center text-2xl font-mono tracking-widest outline-none"
                      style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={loading || code.length < 6}
                      className="w-full py-3 rounded-lg font-bold text-sm bg-primary text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirmar Código do E-mail"}
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {method === "backup" && (
              <motion.div key="backup-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <label className="text-xs font-bold text-[var(--dash-text-muted)] block text-center">
                  Insira um dos seus 8 códigos de backup (ex: A8K2-9M4L)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EX: A8K2-9M4L"
                  className="w-full rounded-lg border p-3 text-center text-lg font-mono tracking-wider outline-none"
                  style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
                <button
                  type="button"
                  onClick={handleVerifyBackup}
                  disabled={loading || !code}
                  className="w-full py-3 rounded-lg font-bold text-sm bg-primary text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Validar Código de Backup"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
