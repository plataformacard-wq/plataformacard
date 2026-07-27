"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Fingerprint, Mail, Key, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { verifyBackupCode, sendEmailMfaCode, verifyEmailMfaCode, trustDeviceForUser } from "@/lib/auth/mfaActions";
import { isPasskeySupported, authenticatePasskey } from "@/lib/auth/passkey-helpers";

export default function Entrar2FaPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"totp" | "passkey" | "email" | "backup">("totp");
  const [code, setCode] = useState<string>("");
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [passkeyAvailable, setPasskeyAvailable] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingUser, setCheckingUser] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

  useEffect(() => {
    initCheck();
  }, []);

  const initCheck = async () => {
    setCheckingUser(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/entrar");
        return;
      }

      setUserEmail(user.email || "");
      setUserId(user.id);

      const supported = await isPasskeySupported();
      setPasskeyAvailable(supported);
      if (supported) {
        setMethod("passkey");
      }
    } catch (err) {
      console.error("Erro ao verificar sessão 2FA:", err);
      router.push("/entrar");
    } finally {
      setCheckingUser(false);
    }
  };

  const finalizeLogin = async () => {
    if (rememberDevice && userId) {
      await trustDeviceForUser(userId);
    }
    router.push("/dashboard");
    router.refresh();
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
        throw new Error("Fator 2FA não configurado nesta conta.");
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeError || !challengeData) {
        throw new Error(challengeError?.message || "Erro ao solicitar código de verificação.");
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        throw new Error("Código de 6 dígitos incorreto. Tente novamente.");
      }

      await finalizeLogin();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de verificação.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasskey = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await authenticatePasskey(userEmail || "Lojista");
      if (!res.success) {
        throw new Error(res.error || "Falha na leitura biométrica.");
      }

      await finalizeLogin();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro na autenticação biométrica.");
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

      await finalizeLogin();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de verificação.");
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

      await finalizeLogin();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de código de backup.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dash-bg,#09090b)] text-white">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--dash-bg,#09090b)] text-[var(--dash-text-primary,#f4f4f5)] relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[27px] border p-8 shadow-2xl transition-colors relative"
        style={{ background: "var(--dash-surface, #18181b)", borderColor: "var(--dash-border, #27272a)" }}
      >
        <button
          onClick={() => router.push("/entrar")}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--dash-text-muted)] hover:text-primary transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={14} /> Voltar para o Login
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-xl font-bold">Verificação em Duas Etapas</h1>
          <p className="text-xs text-[var(--dash-text-muted)] mt-1">
            Sua conta está protegida por 2FA. Digite o código para continuar.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-center justify-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Seletor de Abas */}
        <div className="flex rounded-xl border p-1 gap-1 mb-6" style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}>
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
              method === "totp" ? "bg-emerald-500 text-white shadow-sm" : "text-[var(--dash-text-muted)] hover:text-primary"
            }`}
          >
            <ShieldCheck size={14} /> App 2FA
          </button>
          <button
            type="button"
            onClick={() => { setMethod("email"); setCode(""); setErrorMsg(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              method === "email" ? "bg-emerald-500 text-white shadow-sm" : "text-[var(--dash-text-muted)] hover:text-primary"
            }`}
          >
            <Mail size={14} /> E-mail
          </button>
          <button
            type="button"
            onClick={() => { setMethod("backup"); setCode(""); setErrorMsg(""); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              method === "backup" ? "bg-emerald-500 text-white shadow-sm" : "text-[var(--dash-text-muted)] hover:text-primary"
            }`}
          >
            <Key size={14} /> Backup
          </button>
        </div>

        <AnimatePresence mode="wait">
          {method === "passkey" && (
            <motion.div key="passkey-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
              <p className="text-xs text-[var(--dash-text-muted)]">Toque na digital do seu dispositivo para autenticar o login</p>
              <button
                type="button"
                onClick={handleVerifyPasskey}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Fingerprint size={22} />}
                Entrar com Digital / Face ID
              </button>
            </motion.div>
          )}

          {method === "totp" && (
            <motion.div key="totp-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <label className="text-xs font-bold text-[var(--dash-text-muted)] block text-center">
                Insira o código de 6 dígitos do seu app autenticador
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-xl border p-4 text-center text-3xl font-mono tracking-widest outline-none"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
              <button
                type="button"
                onClick={handleVerifyTotp}
                disabled={loading || code.length < 6}
                className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Verificar e Entrar"}
              </button>
            </motion.div>
          )}

          {method === "email" && (
            <motion.div key="email-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {!emailSent ? (
                <div className="text-center py-2 space-y-4">
                  <p className="text-xs text-[var(--dash-text-muted)]">
                    Enviaremos um código temporário de verificação para o e-mail: <strong>{userEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                    Enviar Código para o E-mail
                  </button>
                </div>
              ) : (
                <>
                  <label className="text-xs font-bold text-[var(--dash-text-muted)] block text-center">
                    Digite o código de 6 dígitos enviado por e-mail
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-xl border p-4 text-center text-3xl font-mono tracking-widest outline-none"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={loading || code.length < 6}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirmar e Entrar"}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {method === "backup" && (
            <motion.div key="backup-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <label className="text-xs font-bold text-[var(--dash-text-muted)] block text-center">
                Insira um dos seus 8 códigos de backup
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EX: A8K2-9M4L"
                className="w-full rounded-xl border p-4 text-center text-xl font-mono tracking-wider outline-none"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
              <button
                type="button"
                onClick={handleVerifyBackup}
                disabled={loading || !code}
                className="w-full py-4 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Validar Código e Entrar"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opção Dispositivo Confiável */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
          <label className="flex items-center gap-2 text-xs text-[var(--dash-text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500"
            />
            Lembrar deste dispositivo por 30 dias
          </label>
        </div>
      </motion.div>
    </div>
  );
}
