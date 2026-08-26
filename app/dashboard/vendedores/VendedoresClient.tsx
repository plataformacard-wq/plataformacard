"use client";

import { AnimatePresence } from "framer-motion";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";
import VendedoresListView from "@/components/dashboard/vendedores/VendedoresListView";
import VendedoresForm from "@/components/dashboard/vendedores/VendedoresForm";
import VendedoresUpsellBanner from "@/components/dashboard/vendedores/VendedoresUpsellBanner";
import { useVendedoresState } from "@/components/dashboard/vendedores/hooks/useVendedoresState";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import UpgradeModal from "@/components/dashboard/upsell/UpgradeModal";

interface VendedoresClientProps {
  initialSellerLimit?: number;
  initialSellerCount?: number;
  customDomain?: string | null;
}

export default function VendedoresClient({
  initialSellerLimit = 0,
  initialSellerCount = 0,
  customDomain = null,
}: VendedoresClientProps) {
  const state = useVendedoresState({
    initialSellerLimit,
    initialSellerCount,
  });

  const {
    requestFeature,
    isOpen: isUpgradeOpen,
    closeModal: closeUpgradeModal,
    requestedFeature,
  } = useFeatureGate();

  return (
    <div className="space-y-6 pb-20">
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={closeUpgradeModal}
        feature={requestedFeature}
      />

      <VendedoresUpsellBanner
        sellerLimit={state.sellerLimit}
        onRequestUpgrade={requestFeature}
      />

      <AnimatePresence mode="wait">
        {state.view === "list" ? (
          <VendedoresListView
            vendedores={state.vendedores}
            sellerLimit={state.sellerLimit}
            sellerCount={state.sellerCount}
            searchQuery={state.searchQuery}
            setSearchQuery={state.setSearchQuery}
            handleOpenForm={state.handleOpenForm}
            handleToggleStatus={state.handleToggleStatus}
            customDomain={customDomain}
            loading={state.loading}
          />
        ) : (
          <VendedoresForm
            selectedSeller={state.selectedSeller}
            setView={state.setView}
            isB2C={state.isB2C}
            formAvatar={state.formAvatar}
            formAvatarFile={state.formAvatarFile}
            setActiveUploadType={state.setActiveUploadType}
            setShowImageEditor={state.setShowImageEditor}
            formPublicBanner={state.formPublicBanner}
            formPublicBannerFile={state.formPublicBannerFile}
            formRecessDays={state.formRecessDays}
            formRecessHours={state.formRecessHours}
            setShowTerminateConfirm={state.setShowTerminateConfirm}
            showTerminateConfirm={state.showTerminateConfirm}
            terminating={state.terminating}
            handleTerminateSeller={state.handleTerminate}
            formName={state.formName}
            setFormName={state.setFormName}
            formEmail={state.formEmail}
            setFormEmail={state.setFormEmail}
            formJobTitle={state.formJobTitle}
            setFormJobTitle={state.setFormJobTitle}
            formWhatsapp={state.formWhatsapp}
            setFormWhatsapp={state.setFormWhatsapp}
            formWhatsappTemplate={state.formWhatsappTemplate}
            setFormWhatsappTemplate={state.setFormWhatsappTemplate}
            formBio={state.formBio}
            setFormBio={state.setFormBio}
            formAvailable={state.formAvailable}
            setFormAvailable={state.setFormAvailable}
            formRecessActive={state.formRecessActive}
            setFormRecessActive={state.setFormRecessActive}
            formAcceptsMessagesWhenClosed={state.formAcceptsMessagesWhenClosed}
            setFormAcceptsMessagesWhenClosed={state.setFormAcceptsMessagesWhenClosed}
            formCanCustomize={state.formCanCustomize}
            setFormCanCustomize={state.setFormCanCustomize}
            formRedirectLeads={state.formRedirectLeads}
            setFormRedirectLeads={state.setFormRedirectLeads}
            formHidePrices={state.formHidePrices}
            setFormHidePrices={state.setFormHidePrices}
            formSlug={state.formSlug}
            setFormSlug={state.setFormSlug}
            formRole={state.formRole}
            setFormRole={state.setFormRole}
            saving={state.saving}
            handleSaveSeller={state.handleSave}
            customDomain={customDomain}
            setFormAvatar={state.setFormAvatar}
            setFormAvatarFile={state.setFormAvatarFile}
            setFormPublicBanner={state.setFormPublicBanner}
            setFormPublicBannerFile={state.setFormPublicBannerFile}
            setShowHoursConfig={state.setShowHoursConfig}
            showHoursConfig={state.showHoursConfig}
            formHours={state.formHours}
            message={state.message}
            isFormValid={state.isFormValid}
            handleTerminate={state.handleTerminate}
            handleSave={state.handleSave}
            handleDayToggle={state.handleDayToggle}
            handleShiftChange={state.handleShiftChange}
          />
        )}
      </AnimatePresence>

      {state.showImageEditor && (
        <ImageEditorModal
          isOpen={state.showImageEditor}
          onClose={() => state.setShowImageEditor(false)}
          aspectRatio={state.activeUploadType === "avatar" ? 1 : 3}
          minWidth={state.activeUploadType === "avatar" ? 400 : 1200}
          minHeight={state.activeUploadType === "avatar" ? 400 : 400}
          onConfirm={state.handleImageCropConfirm}
        />
      )}
    </div>
  );
}
