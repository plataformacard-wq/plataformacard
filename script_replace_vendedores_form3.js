const fs = require('fs');
const path = require('path');

const pagePath = path.join('c:', 'Users', 'Start', 'plataformacard', 'app', 'dashboard', 'vendedores', 'VendedoresClient.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const importStatement = 'import VendedoresForm from "@/components/dashboard/vendedores/VendedoresForm";\n';
if (!pageContent.includes('VendedoresForm')) {
  const lastImportIndex = pageContent.lastIndexOf('import ');
  const insertIndex = pageContent.indexOf('\n', lastImportIndex) + 1;
  pageContent = pageContent.slice(0, insertIndex) + importStatement + pageContent.slice(insertIndex);
}

const lines = pageContent.split('\n');

const startIdx = lines.findIndex(l => l.includes('key="form"')) - 1;
const endIdx = lines.findIndex(l => l.includes('{showImageEditor && (')) - 4; // this goes exactly to </motion.div>

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `          <VendedoresForm
            selectedSeller={selectedSeller}
            setView={setView}
            isB2C={isB2C}
            formAvatar={formAvatar}
            formAvatarFile={formAvatarFile}
            setActiveUploadType={setActiveUploadType}
            setShowImageEditor={setShowImageEditor}
            formPublicBanner={formPublicBanner}
            formPublicBannerFile={formPublicBannerFile}
            formRecessDays={formRecessDays}
            formRecessHours={formRecessHours}
            setShowTerminateConfirm={setShowTerminateConfirm}
            showTerminateConfirm={showTerminateConfirm}
            terminating={terminating}
            handleTerminateSeller={handleTerminate}
            formName={formName}
            setFormName={setFormName}
            formEmail={formEmail}
            setFormEmail={setFormEmail}
            formJobTitle={formJobTitle}
            setFormJobTitle={setFormJobTitle}
            formWhatsapp={formWhatsapp}
            setFormWhatsapp={setFormWhatsapp}
            formWhatsappTemplate={formWhatsappTemplate}
            setFormWhatsappTemplate={setFormWhatsappTemplate}
            formBio={formBio}
            setFormBio={setFormBio}
            formAvailable={formAvailable}
            setFormAvailable={setFormAvailable}
            formRecessActive={formRecessActive}
            setFormRecessActive={setFormRecessActive}
            setFormRecessDays={setFormRecessDays}
            setFormRecessHours={setFormRecessHours}
            formAcceptsMessagesWhenClosed={formAcceptsMessagesWhenClosed}
            setFormAcceptsMessagesWhenClosed={setFormAcceptsMessagesWhenClosed}
            formCanCustomize={formCanCustomize}
            setFormCanCustomize={setFormCanCustomize}
            formRedirectLeads={formRedirectLeads}
            setFormRedirectLeads={setFormRedirectLeads}
            formHidePrices={formHidePrices}
            setFormHidePrices={setFormHidePrices}
            formAccessCatalog={formAccessCatalog}
            setFormAccessCatalog={setFormAccessCatalog}
            formAccessAnalytics={formAccessAnalytics}
            setFormAccessAnalytics={setFormAccessAnalytics}
            formAccessCompany={formAccessCompany}
            setFormAccessCompany={setFormAccessCompany}
            formSlug={formSlug}
            setFormSlug={setFormSlug}
            formPassword={formPassword}
            setFormPassword={setFormPassword}
            saving={saving}
            handleSaveSeller={handleSave}
            customDomain={customDomain}
            setFormAvatar={setFormAvatar}
            setFormAvatarFile={setFormAvatarFile}
            setFormPublicBanner={setFormPublicBanner}
            setFormPublicBannerFile={setFormPublicBannerFile}
            setShowHoursConfig={setShowHoursConfig}
            showHoursConfig={showHoursConfig}
            formHours={formHours}
            message={message}
            isFormValid={isFormValid}
            handleTerminate={handleTerminate}
            handleSave={handleSave}
            handleDayToggle={handleDayToggle}
            handleShiftChange={handleShiftChange}
          />`;
    
    lines.splice(startIdx, endIdx - startIdx + 1, replacement);
    fs.writeFileSync(pagePath, lines.join('\n'), 'utf8');
    console.log("Successfully replaced VendedoresForm. Lines replaced: " + (endIdx - startIdx + 1));
} else {
    console.log("Could not find start or end index.");
}
