"use client";

import React from "react";
import { useProfileManager } from "@/app/dashboard/perfil/useProfileManager";
import ProfileIdentitySection from "@/components/dashboard/perfil/ProfileIdentitySection";
import ProfileSecuritySection from "@/components/dashboard/perfil/ProfileSecuritySection";
import { ShieldCheck, UserCircle, Key } from "lucide-react";

type SellerProfileViewProps = {
  manager: ReturnType<typeof useProfileManager>;
};

export default function SellerProfileView({ manager }: SellerProfileViewProps) {
  const { granularPermissions, view, setView } = manager;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b" style={{ borderColor: "var(--dash-border)" }}>
        <button
          onClick={() => setView("card")}
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
            view === "card"
              ? "border-[var(--dash-primary)] text-[var(--dash-primary)]"
              : "border-transparent text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCircle size={18} /> Meu Cartão
          </div>
        </button>
        <button
          onClick={() => setView("security")}
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
            view === "security"
              ? "border-[var(--dash-primary)] text-[var(--dash-primary)]"
              : "border-transparent text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Key size={18} /> Segurança
          </div>
        </button>
      </div>

      <div className="w-full">
        <div className="w-full">
          {view === "card" && (
            <ProfileIdentitySection 
              view={view}
              isAvailable={manager.isAvailable}
              recessActive={manager.recessActive}
              setIsAvailable={manager.setIsAvailable}
              userSlug={manager.activeProfileUserId ? `${manager.slugOriginal || manager.slugInput}` : null}
              activeProfileUserId={manager.activeProfileUserId}
              customDomain={manager.customDomain}
              avatarPreview={manager.avatarPreview}
              setActiveUploadType={manager.setActiveUploadType}
              setShowImageEditor={manager.setShowImageEditor}
              setAvatar={manager.setAvatar}
              setAvatarFile={manager.setAvatarFile}
              nameInput={manager.nameInput}
              setNameInput={manager.setNameInput}
              jobTitleInput={manager.jobTitleInput}
              setJobTitleInput={manager.setJobTitleInput}
              bioInput={manager.bioInput}
              setBioInput={manager.setBioInput}
              publicBannerPreview={manager.publicBannerFile ? URL.createObjectURL(manager.publicBannerFile) : manager.publicBanner}
              setPublicBanner={manager.setPublicBanner}
              setPublicBannerFile={manager.setPublicBannerFile}
              whatsappInput={manager.whatsappInput}
              setWhatsappInput={manager.setWhatsappInput}
              slugInput={manager.slugInput}
              handleSlugChange={(e: any) => manager.handleSlugChange(e.target.value)}
              slugChecking={manager.slugChecking}
              slugError={manager.slugError}
              whatsappTemplateInput={manager.whatsappTemplateInput}
              setWhatsappTemplateInput={manager.setWhatsappTemplateInput}
              redirectLeads={manager.redirectLeads}
              setRedirectLeads={manager.setRedirectLeads}
              isAcceptingOrders={manager.isAcceptingOrders}
              setIsAcceptingOrders={manager.setIsAcceptingOrders}
              recessDays={manager.recessDays}
              setRecessDays={manager.setRecessDays}
              recessHours={manager.recessHours}
              setRecessHours={manager.setRecessHours}
              setRecessActive={manager.setRecessActive}
              showHoursConfig={manager.showHoursConfig}
              setShowHoursConfig={manager.setShowHoursConfig}
              canCustomize={manager.canCustomize}
              useCompanyHours={manager.useCompanyHours}
              setUseCompanyHours={manager.setUseCompanyHours}
              customBusinessHours={manager.customBusinessHours}
              setCustomBusinessHours={manager.setCustomBusinessHours}
              businessModel={manager.businessModel}
              saving={manager.saving}
              handleSave={manager.handleSave}
              slugOriginal={manager.slugOriginal}
              publicBanner={manager.publicBanner}
              publicBannerFile={manager.publicBannerFile}
              acceptsMessagesWhenClosed={manager.acceptsMessagesWhenClosed}
              setAcceptsMessagesWhenClosed={manager.setAcceptsMessagesWhenClosed}
              granularPermissions={manager.granularPermissions}
            />
          )}

          {view === "security" && (
            <div className="space-y-6">
              {/* Ocultamos intencionalmente a parte de Nome de Conta, Email e Domínio para o vendedor,
                  mantendo apenas a troca de senha e logout de sessões. 
                  Isso pode ser feito passando propriedades vazias ou criando uma nova interface,
                  mas vamos reaproveitar e passar apenas a parte de senhas na UI (usando um wrapper ou ajustando ProfileSecuritySection).
                  Para manter simples, renderizamos os campos de senha aqui.
              */}
              <div
                className="rounded-[27px] border p-6 shadow-sm transition-colors"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Key size={18} className="text-primary" /> Alterar Senha de Acesso
                </h2>
                <div className="mt-4 space-y-4 max-w-md">
                  <div>
                    <label className="text-sm mb-1 block" style={{ color: "var(--dash-text-secondary)" }}>Nova Senha</label>
                    <input
                      type="password"
                      value={manager.newPassword}
                      onChange={(e) => manager.setNewPassword(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                      style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block" style={{ color: "var(--dash-text-secondary)" }}>Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={manager.confirmNewPassword}
                      onChange={(e) => manager.setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                      style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div className="flex justify-end w-full">
                    <button
                      type="button"
                      onClick={manager.handleChangePassword}
                      disabled={manager.changingPassword}
                      className="mt-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-[var(--dash-primary)] text-[var(--dash-primary-foreground)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {manager.changingPassword ? "Solicitando..." : "Redefinir Senha"}
                    </button>
                  </div>
                  {manager.otpSent && (
                    <div className="mt-4 p-4 rounded-xl border border-primary bg-primary/5">
                      <p className="text-sm mb-2" style={{ color: "var(--dash-text-primary)" }}>
                        Enviamos um código para o seu e-mail vinculado (ou fale com o gestor).
                      </p>
                      <input
                        type="text"
                        placeholder="Digite o código"
                        value={manager.otpCode}
                        onChange={(e) => manager.setOtpCode(e.target.value)}
                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors mb-2"
                        style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
                      <button
                        type="button"
                        onClick={manager.handleVerifyOtp}
                        disabled={manager.changingPassword}
                        className="w-full px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirmar Troca de Senha
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="rounded-[27px] border p-6 shadow-sm transition-colors"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                      <ShieldCheck size={18} className="text-emerald-500" /> Sessões e Dispositivos
                    </h2>
                    <p className="mt-1 text-sm text-[var(--dash-text-muted)]">
                      Você está logado neste navegador agora. Desconecte outros aparelhos se necessário.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={manager.handleSignOutOtherSessions}
                    disabled={manager.saving}
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all border text-red-500 border-red-500/20 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {manager.saving ? "Desconectando..." : "Desconectar Outros"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

function PermissionItem({ label, hasPermission }: { label: string, hasPermission: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>{label}</span>
      <span className={`text-xs px-2 py-1 rounded-full font-bold ${hasPermission ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
        {hasPermission ? 'Liberado' : 'Bloqueado'}
      </span>
    </div>
  );
}
