"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, KeyRound, ArrowLeft } from "lucide-react";

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redireciona se já estiver logado (validação segura)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && step === 1) { // Só redireciona se estiver no step inicial, senão interrompe a redefinição
        router.replace("/dashboard");
      }
    });
  }, [supabase, router, step]);

  async function handleSendEmail(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Código enviado! Verifique seu e-mail.");
    setStep(2);
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    if (otpCode.length < 6) return;
    
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "recovery"
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Código inválido ou expirado. Tente novamente.");
      return;
    }

    if (data.user) {
      setSuccessMessage("Código validado! Digite sua nova senha.");
      setStep(3);
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Senha atualizada com sucesso! Redirecionando...");
    
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white relative overflow-hidden flex flex-col justify-center">
      {/* Elemento de fundo decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto w-full max-w-md relative z-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="mb-8">
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black mb-4">
              PlataformaShop
            </div>
            <h1 className="text-2xl font-bold">Recuperar acesso</h1>
            <p className="mt-2 text-sm text-zinc-300">
              {step === 1 && "Informe seu e-mail para receber um código de recuperação."}
              {step === 2 && "Insira o código de 6 dígitos que enviamos para o seu e-mail."}
              {step === 3 && "Crie sua nova senha segura para acessar o painel."}
            </p>
          </div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {errorMessage}
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {successMessage}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendEmail} 
                className="space-y-5"
              >
                <div>
                  <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Mail size={16} className="text-zinc-400" />
                    Seu e-mail de acesso
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-5"
              >
                <div>
                  <label htmlFor="otp" className="mb-2 flex items-center gap-2 text-sm font-medium justify-center">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    Código de Segurança
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-4 text-center text-3xl tracking-[1em] indent-[1em] font-bold outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? "Verificando..." : "Validar código"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Não recebeu? Tentar outro e-mail
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleUpdatePassword} 
                className="space-y-5"
              >
                <div>
                  <label htmlFor="new-password" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <KeyRound size={16} className="text-zinc-400" />
                    Nova Senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="mb-2 flex items-center gap-2 text-sm font-medium">
                    Repita a Nova Senha
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {step === 1 && (
            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <Link href="/entrar" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}