"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, QrCode, Copy, Check, Key, Loader2, Download, AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateAndSaveBackupCodes } from "@/lib/auth/mfaActions";

type MfaEnrollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function MfaEnrollModal({ isOpen, onClose, onSuccess }: MfaEnrollModalProps) {
  const [step, setStep] = useState<"qr" | "verify" | "backup">("qr");
  const [factorId, setFactorId] = useState<string>("");
  const [qrCodeSvg, setQrCodeSvg] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      initEnrollment();
    } else {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep("qr");
    setFactorId("");
    setQrCodeSvg("");
    setSecretKey("");
    setVerifyCode("");
    setBackupCodes([]);
    setLoading(false);
    setErrorMsg("");
  };

  const initEnrollment = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const supabase = createClient();

      // Limpar fatores não-verificados acumulados no Supabase Auth para evitar erro de duplicidade
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      if (factorsData?.all && factorsData.all.length > 0) {
        const unverified = factorsData.all.filter((f) => f.status === "unverified");
        for (const f of unverified) {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "PlataformaShop",
      });

      if (error || !data) {
        throw new Error(error?.message || "Falha ao solicitar chave MFA ao servidor.");
      }

      setFactorId(data.id);
      setQrCodeSvg(data.totp.qr_code || "");
      setSecretKey(data.totp.secret || "");
    } catch (err: any) {
      setErrorMsg(err.message || "Não foi possível gerar o código QR.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleVerifyFactor = async () => {
    if (!verifyCode || verifyCode.length < 6) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      
      // Cria challenge e verifica o fator de autenticação
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError || !challengeData) {
        throw new Error(challengeError?.message || "Erro ao preparar desafio 2FA.");
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) {
        throw new Error("Código de 6 dígitos incorreto. Verifique no seu app autenticador e tente novamente.");
      }

      // 2FA verificado com sucesso! Gerar códigos de backup de emergência
      const res = await generateAndSaveBackupCodes();
      if (res.success && res.codes) {
        setBackupCodes(res.codes);
        setStep("backup");
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Código inválido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    if (backupCodes.length > 0) {
      const text = `CÓDIGOS DE BACKUP DE EMERGÊNCIA - PLATAFORMASHOP\n\n` + backupCodes.join("\n") + `\n\nGuarde estes códigos em local seguro.`;
      navigator.clipboard.writeText(text);
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = `CÓDIGOS DE BACKUP DE EMERGÊNCIA - PLATAFORMASHOP\n\n` + backupCodes.join("\n") + `\n\nGuarde em um local seguro. Cada código só pode ser usado 1 vez.`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "codigos-backup-plataformashop.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-[27px] border p-6 shadow-2xl relative transition-colors overflow-hidden"
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
            <h3 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>
              {step === "backup" ? "Guarde seus Códigos de Emergência" : "Configurar App Autenticador (2FA)"}
            </h3>
            <p className="text-xs text-[var(--dash-text-muted)]">
              {step === "backup" ? "Estes códigos permitirão acessar sua conta se você perder o celular." : "Google Authenticator, Authy ou 1Password"}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading && step === "qr" && !qrCodeSvg ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary mb-2" />
            <p className="text-xs text-[var(--dash-text-muted)]">Gerando chave de segurança...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === "qr" && (
              <motion.div key="qr-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 rounded-[27px] border bg-black/5 dark:bg-[var(--dash-surface)]/5 flex flex-col items-center justify-center text-center" style={{ borderColor: "var(--dash-border)" }}>
                  {qrCodeSvg ? (
                    <div className="p-3 bg-[var(--dash-surface)] rounded-lg shadow-md mb-3 flex items-center justify-center">
                      {qrCodeSvg.startsWith("data:") || qrCodeSvg.startsWith("http") ? (
                        <img src={qrCodeSvg} alt="QR Code 2FA" className="w-48 h-48 object-contain" />
                      ) : (
                        <div
                          className="w-48 h-48 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: qrCodeSvg.replace(/^data:image\/svg\+xml;utf-8,/, "") }}
                        />
                      )}
                    </div>
                  ) : (
                    <QrCode size={120} className="text-primary mb-3" />
                  )}
                  <p className="text-xs text-[var(--dash-text-muted)]">
                    Escaneie o QR Code acima com o app <strong>Google Authenticator</strong> ou <strong>Authy</strong> no seu celular.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] block mb-1">
                    Não consegue escanear? Copie a chave manual:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={secretKey}
                      className="w-full rounded-lg border px-3 py-2 text-xs font-mono outline-none"
                      style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1 shrink-0"
                    >
                      {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep("verify")}
                    className="w-full py-3 rounded-lg font-bold text-sm bg-primary text-white hover:opacity-90 transition-all shadow-md active:scale-95"
                  >
                    Já escaneei! Avançar
                  </button>
                </div>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div key="verify-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="text-center py-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                    Digite o código de 6 dígitos gerado no aplicativo
                  </p>
                  <p className="text-xs text-[var(--dash-text-muted)] mt-1">
                    Isso confirma que o seu aplicativo de autenticação está vinculado corretamente.
                  </p>
                </div>

                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-lg border p-3 text-center text-3xl font-mono tracking-widest outline-none transition-colors"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("qr")}
                    className="w-1/3 py-3 rounded-lg font-bold text-xs border text-[var(--dash-text-muted)] hover:bg-black/5 transition-all"
                    style={{ borderColor: "var(--dash-border)" }}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyFactor}
                    disabled={loading || verifyCode.length < 6}
                    className="w-2/3 py-3 rounded-lg font-bold text-sm bg-primary text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Ativar 2FA Agora"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === "backup" && (
              <motion.div key="backup-step" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <div className="p-4 rounded-[27px] border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <ShieldCheck size={18} className="shrink-0" />
                  <span><strong>2FA Ativado com Sucesso!</strong> Salve seus códigos de recuperação abaixo:</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4 rounded-[27px] border bg-black/5 dark:bg-[var(--dash-surface)]/5 font-mono text-center text-sm font-bold tracking-wider" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}>
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="p-2 rounded-lg border bg-[var(--dash-surface)]" style={{ borderColor: "var(--dash-border)" }}>
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBackupCodes}
                    className="w-1/2 py-2.5 rounded-lg font-bold text-xs border flex items-center justify-center gap-1.5 hover:bg-black/5 transition-all"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  >
                    {copiedBackup ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copiedBackup ? "Copiado!" : "Copiar Códigos"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBackupCodes}
                    className="w-1/2 py-2.5 rounded-lg font-bold text-xs border flex items-center justify-center gap-1.5 hover:bg-black/5 transition-all"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  >
                    <Download size={14} />
                    Baixar Arquivo .txt
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-3 rounded-lg font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md active:scale-95 mt-2"
                >
                  Concluir e Ir para o Painel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
