"use client";

import React, { useState, useEffect, useRef } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, MessageCircle, Loader2, ArrowRight, RefreshCw, X, AlertCircle } from "lucide-react";

interface B2bDeviceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  maskedPhone: string;
  token: string;
  deviceId: string;
  onVerified: (data: { client: any; prices: Record<string, number>; anchorPrices: Record<string, number> }) => void;
}

export const B2bDeviceVerificationModal: React.FC<B2bDeviceVerificationModalProps> = ({
  isOpen,
  onClose,
  companyName,
  maskedPhone,
  token,
  deviceId,
  onVerified,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Disparar envio inicial do código ao abrir
  useEffect(() => {
    if (!isOpen || !token) return;

    const requestOtp = async () => {
      setResending(true);
      setErrorMsg(null);
      try {
        const res = await fetch("/api/b2b/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
          setCountdown(60);
          setCanResend(false);
        } else {
          setErrorMsg(data.error || "Não foi possível enviar o código.");
        }
      } catch (err) {
        setErrorMsg("Erro de conexão ao solicitar código.");
      } finally {
        setResending(false);
      }
    };

    requestOtp();
    // Focar no primeiro input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
  }, [isOpen, token]);

  // Contador de reenvio
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    setErrorMsg(null);
    const clean = val.replace(/\D/g, "");

    // Se o usuário colou o código completo de 6 dígitos
    if (clean.length >= 6) {
      const newDigits = clean.slice(0, 6).split("");
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      verifyCode(newDigits.join(""));
      return;
    }

    const lastChar = clean.slice(-1);
    const updated = [...digits];
    updated[index] = lastChar;
    setDigits(updated);

    if (lastChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Se preencheu o último dígito
    if (index === 5 && lastChar) {
      const fullCode = updated.join("");
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/b2b/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          code,
          deviceId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onVerified({
          client: data.client,
          prices: data.prices || {},
          anchorPrices: data.anchorPrices || {},
        });
      } else {
        setErrorMsg(data.error || "Código inválido ou expirado.");
        // Resetar dígitos
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setErrorMsg("Erro de conexão ao verificar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/b2b/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
        setCountdown(60);
        setCanResend(false);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg(data.error || "Erro ao reenviar código.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão.");
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md bg-[var(--public-card-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] rounded-3xl shadow-2xl p-6 sm:p-8 relative flex flex-col items-center text-center space-y-5 overflow-hidden"
        >
          {/* Botão de Fechar / Sair do modo B2B */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] hover:bg-[var(--public-bg)] transition-colors cursor-pointer"
            title="Fechar e navegar no modo normal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ícone de Escudo / Segurança */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>

          {/* Cabeçalho */}
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-[var(--public-text-main)]">
              Verificação de Dispositivo B2B
            </h3>
            <p className="text-xs sm:text-sm text-[var(--public-text-dim)] leading-relaxed">
              Detectamos um novo dispositivo para a empresa{" "}
              <strong className="text-[var(--public-text-main)]">{companyName}</strong>.
            </p>
            <p className="text-xs text-[var(--public-text-dim)]">
              Digite o código de 6 dígitos enviado para:{" "}
              <span className="font-mono font-bold text-emerald-500">{maskedPhone}</span>
            </p>
          </div>

          {/* Inputs de 6 Dígitos */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 w-full pt-1">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black rounded-2xl border transition-all ${
                  digit
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm"
                    : "border-[var(--public-card-border)] bg-[var(--public-bg)] text-[var(--public-text-main)] focus:border-emerald-500"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
              />
            ))}
          </div>

          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center justify-center gap-2 w-full">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botão de Verificação Manual */}
          <button
            onClick={() => verifyCode(digits.join(""))}
            disabled={loading || digits.join("").length < 6}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando Dispositivo...</span>
              </>
            ) : (
              <>
                <span>Acessar Portal Atacadista</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Opções de Reenvio / WhatsApp */}
          <div className="w-full space-y-2 pt-1 border-t border-[var(--public-card-border)]/60 text-xs">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] font-bold transition-all flex items-center justify-center gap-2 border border-[#25D366]/30 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ver Código no WhatsApp Comercial</span>
              </a>
            )}

            <div className="text-[11px] text-[var(--public-text-dim)] pt-1 flex items-center justify-center gap-1.5">
              <span>Não recebeu o código?</span>
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-emerald-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Reenviar agora</span>
                </button>
              ) : (
                <span className="font-semibold opacity-70">
                  Reenviar em {countdown}s
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
