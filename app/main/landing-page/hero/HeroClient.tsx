"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { updateLandingSettings, uploadHeroMockup, uploadHeaderLogo } from "../actions";
import { HeaderLogosSection } from "./components/HeaderLogosSection";
import { HeroMockupsSection } from "./components/HeroMockupsSection";
import { HeroTextsSection } from "./components/HeroTextsSection";

export function HeroClient({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  const [uploadingLogoLight, setUploadingLogoLight] = useState(false);
  const [uploadingMockupDark, setUploadingMockupDark] = useState(false);
  const [uploadingMockupLight, setUploadingMockupLight] = useState(false);

  const [form, setForm] = useState(initialSettings || {
    hero_headline: "Venda mais com o catálogo digital perfeito",
    hero_subtitle: "Crie uma vitrine premium para sua empresa, distribuidora ou força de vendas em minutos.",
    seo_title: "PlataformaShop | Catálogo Digital Premium",
    hero_mockup_url: initialSettings?.hero_mockup_url || "",
    hero_mockup_url_light: initialSettings?.hero_mockup_url_light || "",
    logo_url_dark: initialSettings?.logo_url_dark || "",
    logo_url_light: initialSettings?.logo_url_light || "",
    base_users: initialSettings?.base_users || 1500,
    base_catalogs: initialSettings?.base_catalogs || 3200,
    social_instagram: initialSettings?.social_instagram || "",
    social_facebook: initialSettings?.social_facebook || "",
    social_linkedin: initialSettings?.social_linkedin || "",
    social_youtube: initialSettings?.social_youtube || "",
    social_tiktok: initialSettings?.social_tiktok || "",
    social_x: initialSettings?.social_x || "",
    support_email: initialSettings?.support_email || "",
    support_phone: initialSettings?.support_phone || "",
  });

  function handleDownloadImage(url: string, filename: string) {
    if (!url) {
      alert("Nenhuma imagem disponível para download.");
      return;
    }
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        window.open(url, "_blank");
      });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateLandingSettings(form);
      if (res?.error) {
        alert("Erro: " + res.error);
      } else {
        alert("Configurações do Hero & SEO salvas com sucesso!");
      }
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function processLogoUpload(file: File, themeType: 'dark' | 'light') {
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      return;
    }

    if (themeType === 'dark') setUploadingLogoDark(true);
    else setUploadingLogoLight(true);

    try {
      let fileToUpload = file;
      try {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          fileType: "image/webp"
        });
        fileToUpload = new File([compressedBlob], `logo_${themeType}_${Date.now()}.webp`, { type: "image/webp" });
      } catch (err) {
        console.warn("Compressão de logo falhou, usando original:", err);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await uploadHeaderLogo(formData, themeType);

      if (res.success && res.publicUrl) {
        const fieldKey = themeType === 'dark' ? 'logo_url_dark' : 'logo_url_light';
        const updatedForm = {
          ...form,
          [fieldKey]: res.publicUrl
        };
        setForm(updatedForm);
        const saveRes = await updateLandingSettings(updatedForm);
        if (saveRes?.error) {
          alert(`Logo enviada, mas falhou ao publicar automaticamente: ${saveRes.error}`);
        } else {
          alert(`Logo (${themeType === 'dark' ? 'Tema Escuro' : 'Tema Claro'}) enviada e publicada com sucesso na Landing Page!`);
        }
      } else {
        alert(res.error || "Erro ao fazer upload da logo.");
      }
    } catch (e) {
      alert("Erro ao enviar imagem.");
    } finally {
      if (themeType === 'dark') setUploadingLogoDark(false);
      else setUploadingLogoLight(false);
    }
  }

  async function processMockupUpload(file: File, themeType: 'dark' | 'light') {
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      return;
    }

    if (themeType === 'dark') setUploadingMockupDark(true);
    else setUploadingMockupLight(true);

    try {
      let fileToUpload = file;
      try {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
          fileType: "image/webp"
        });
        fileToUpload = new File([compressedBlob], `hero_mockup_${themeType}_${Date.now()}.webp`, { type: "image/webp" });
      } catch (err) {
        console.warn("Compressão de mockup falhou, usando original:", err);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await uploadHeroMockup(formData, themeType);

      if (res.success && res.publicUrl) {
        const fieldKey = themeType === 'dark' ? 'hero_mockup_url' : 'hero_mockup_url_light';
        const updatedForm = {
          ...form,
          [fieldKey]: res.publicUrl
        };
        setForm(updatedForm);
        const saveRes = await updateLandingSettings(updatedForm);
        if (saveRes?.error) {
          alert(`Mockup enviado, mas falhou ao publicar automaticamente: ${saveRes.error}`);
        } else {
          alert(`Mockup Hero (${themeType === 'dark' ? 'Tema Escuro' : 'Tema Claro'}) enviado e publicado com sucesso na Landing Page!`);
        }
      } else {
        alert(res.error || "Erro ao fazer upload do mockup.");
      }
    } catch (e) {
      alert("Erro ao enviar imagem.");
    } finally {
      if (themeType === 'dark') setUploadingMockupDark(false);
      else setUploadingMockupLight(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 🖼️ CARD 1: UPLOAD DUPLO DE LOGOS DO HEADER (TEMA CLARO & ESCURO) */}
      <HeaderLogosSection
        form={form}
        setForm={setForm}
        uploadingLogoDark={uploadingLogoDark}
        uploadingLogoLight={uploadingLogoLight}
        processLogoUpload={processLogoUpload}
        handleDownloadImage={handleDownloadImage}
      />

      {/* 📱 CARD 2: UPLOAD DUPLO DE MOCKUPS DO HERO (TEMA CLARO & ESCURO) */}
      <HeroMockupsSection
        form={form}
        setForm={setForm}
        uploadingMockupDark={uploadingMockupDark}
        uploadingMockupLight={uploadingMockupLight}
        processMockupUpload={processMockupUpload}
        handleDownloadImage={handleDownloadImage}
      />

      {/* 🚀 CARD 3: PERSONALIZAÇÃO DE TEXTOS & SEO DO HERO */}
      <HeroTextsSection
        form={form}
        setForm={setForm}
        saving={saving}
        handleSave={handleSave}
      />
    </div>
  );
}
