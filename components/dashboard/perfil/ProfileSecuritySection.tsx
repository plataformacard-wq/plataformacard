"use client";

import React from "react";
import { Users, Package, Globe, Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ProfileSecuritySectionProps = {
  accountName: string;
  setAccountName: (val: string) => void;
  handleSaveAccountName: () => void;
  saving: boolean;
  email: string;
  customDomain?: string | null;
  handleSignOutOtherSessions: () => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (val: string) => void;
  changingPassword: boolean;
  handleChangePassword: () => void;
  otpSent: boolean;
  setOtpSent: (val: boolean) => void;
  otpCode: string;
  setOtpCode: (val: string) => void;
  handleVerifyOtp: () => void;
};

export default function ProfileSecuritySection({
  accountName,
  setAccountName,
  handleSaveAccountName,
  saving,
  email,
  customDomain,
  handleSignOutOtherSessions,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  changingPassword,
  handleChangePassword,
  otpSent,
  setOtpSent,
  otpCode,
  setOtpCode,
  handleVerifyOtp,
  granularPermissions
}: ProfileSecuritySectionProps & { granularPermissions?: any }) {
  
  const canEditPassword = granularPermissions?.profile?.password ?? true;
  const canEditBasicInfo = granularPermissions?.profile?.basic_info ?? true;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Nome Administrativo */}
      <div
        className="rounded-[27px] border p-6 shadow-sm transition-colors"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
          <Users size={18} className="text-primary" /> Nome da Conta
        </h2>
        <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
          Este é o nome administrativo do dono da conta (não altera a vitrine).
        </p>
        <div className="mt-4 max-w-md">
          <input
            type="text"
            value={accountName}
            disabled={!canEditBasicInfo}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
          {canEditBasicInfo && (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleSaveAccountName}
                disabled={saving}
                className="mt-4 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Salvando..." : "Salvar Nome"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email de Acesso */}
      <div
        className="rounded-[27px] border p-6 shadow-sm transition-colors"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
          <Package size={18} className="text-primary" /> Email de Acesso
        </h2>
        <p className="mt-2 text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
          {email || "Email não disponível"}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--dash-text-muted)" }}>
          O e-mail é a chave primária da conta e não pode ser alterado por aqui.
        </p>
      </div>

      {/* Domínio Próprio */}
      <div
        className="rounded-[27px] border p-6 shadow-sm transition-colors"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
          <Globe size={18} className="text-primary" /> Configurar Domínio
        </h2>
        <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
          Configure um domínio personalizado (ex: meu-nome.com.br) para o seu cartão virtual, transmitindo ainda mais profissionalismo.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard/perfil/dominio"
            className="inline-flex px-6 py-3 rounded text-sm font-bold transition-all shadow-md active:scale-95 bg-primary text-white hover:opacity-90"
          >
            Configurar Domínio
          </a>
        </div>
      </div>

      {/* Sessões e Dispositivos */}
      <div
        className="rounded-[27px] border p-6 shadow-sm transition-colors"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
          <Clock size={18} className="text-primary" /> Sessões e Dispositivos
        </h2>
        <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
          Gerencie onde a sua conta está logada. Se você esqueceu sua conta aberta em outro computador, pode desconectar todos os outros dispositivos remotamente.
        </p>
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border bg-emerald-500/5" style={{ borderColor: "var(--dash-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Sessão Atual Segura</p>
              <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Você está logado neste navegador agora.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOutOtherSessions}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            Desconectar Outros Dispositivos
          </button>
        </div>
      </div>

      {/* Segurança (Troca de Senha com OTP) */}
      {canEditPassword && (
        <div
          className="rounded-[27px] border p-6 shadow-sm transition-colors"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
            <ShieldCheck size={18} className="text-primary" /> Troca de Senha
          </h2>
          <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
            Sua senha será alterada de forma segura usando um código de verificação enviado ao seu e-mail.
          </p>

          <div className="mt-6 max-w-md">
            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.div
                  key="password-inputs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nova Senha</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                      style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                      style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword || !newPassword || newPassword !== confirmNewPassword}
                    className="w-full px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {changingPassword ? "Enviando Código..." : "Alterar Senha"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 p-6 rounded-[27px] border border-primary/20 bg-primary/5"
                >
                  <div className="text-center">
                    <ShieldCheck size={40} className="text-primary mx-auto mb-3" />
                    <h3 className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>Código de Verificação Enviado</h3>
                    <p className="text-xs text-[var(--dash-text-muted)] mt-1">Verifique o seu e-mail e insira o código de 6 dígitos abaixo.</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={8}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 123456"
                      className="w-full rounded-xl border px-4 py-4 text-center text-2xl tracking-widest font-bold outline-none transition-colors"
                      style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={changingPassword || otpCode.length < 6}
                    className="w-full px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? "Verificando..." : "Validar e Atualizar Senha"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-xs text-[var(--dash-text-muted)] hover:text-primary transition-colors mt-2 font-semibold"
                  >
                    Cancelar e voltar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
