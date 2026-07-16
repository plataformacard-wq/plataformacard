"use client";

import React from "react";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";
import { ShieldCheck } from "lucide-react";
import ProfileSecuritySection from "@/components/dashboard/perfil/ProfileSecuritySection";
import ProfileIdentitySection from "@/components/dashboard/perfil/ProfileIdentitySection";
import SellerProfileView from "@/components/dashboard/perfil/SellerProfileView";
import { useProfileManager } from "./useProfileManager";

export default function PerfilContent() {
  const manager = useProfileManager();

  return (
    <div className="relative space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--dash-text-primary)" }}>
          {manager.view === "card" ? "Editar Cartão Público" : "Meu Perfil"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
          {manager.view === "card" 
            ? "Gerencie as informações que aparecem para seus clientes." 
            : "Gerencie seus dados de acesso e informações administrativas."}
        </p>
      </div>

      {manager.loading ? (
        <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>
          Carregando dados...
        </p>
      ) : !manager.profileAccess ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--dash-text-primary)" }}>Acesso Restrito</h2>
          <p className="max-w-md" style={{ color: "var(--dash-text-secondary)" }}>
            O seu gestor desabilitou o acesso às configurações do seu próprio cadastro. Entre em contato caso precise de alterações.
          </p>
        </div>
      ) : manager.role === "seller" ? (
        <SellerProfileView manager={manager} />
      ) : (
        <>
          {/* Card 1 — Identidade (Gestor/Admin) */}
          {manager.view === "card" && (
            <ProfileIdentitySection 
              view={manager.view}
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
              handleSlugChange={(e: React.ChangeEvent<HTMLInputElement>) => manager.handleSlugChange(e.target.value)}
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
              businessModel={manager.businessModel as "B2B" | "B2C"}
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

          {/* Card Segurança (Gestor/Admin) */}
          {manager.view === "security" && (
            <ProfileSecuritySection 
              accountName={manager.accountName}
              setAccountName={manager.setAccountName}
              handleSaveAccountName={manager.handleSaveAccountName}
              saving={manager.saving}
              email={manager.email}
              customDomain={manager.customDomain}
              handleSignOutOtherSessions={manager.handleSignOutOtherSessions}
              newPassword={manager.newPassword}
              setNewPassword={manager.setNewPassword}
              confirmNewPassword={manager.confirmNewPassword}
              setConfirmNewPassword={manager.setConfirmNewPassword}
              changingPassword={manager.changingPassword}
              handleChangePassword={manager.handleChangePassword}
              otpSent={manager.otpSent}
              setOtpSent={manager.setOtpSent}
              otpCode={manager.otpCode}
              setOtpCode={manager.setOtpCode}
              handleVerifyOtp={manager.handleVerifyOtp}
              granularPermissions={manager.granularPermissions}
            />
          )}
        </>
      )}

      {manager.saveMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg transition-colors"
          style={{
            background: "var(--dash-surface)",
            borderColor: "var(--dash-border)",
            color: "var(--dash-text-primary)",
          }}
        >
          {manager.saveMessage}
        </div>
      )}
      <ImageEditorModal
        title={manager.activeUploadType === "avatar" ? "Editar Foto de Perfil" : "Editar Banner"}
        description={manager.activeUploadType === "avatar" ? "Sua foto de perfil principal." : "Banner que aparece no topo do seu cartão."}
        isOpen={manager.showImageEditor}
        onClose={() => manager.setShowImageEditor(false)}
        onConfirm={manager.onImageEditorConfirm}
        aspectRatio={manager.activeUploadType === "avatar" ? 1 : 3}
        minWidth={manager.activeUploadType === "avatar" ? 400 : 1200}
        minHeight={manager.activeUploadType === "avatar" ? 400 : 400}
      />
    </div>
  );
}
