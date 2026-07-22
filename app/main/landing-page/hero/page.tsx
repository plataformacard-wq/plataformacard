import { getLandingSettings } from "../actions";
import { HeroClient } from "./HeroClient";

export const metadata = {
  title: "Hero & SEO | CMS QG",
};

export default async function HeroPage() {
  const settings = await getLandingSettings();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)]">
          1. Hero & SEO (Cabeçalho da Landing Page)
        </h1>
        <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
          Gerencie o título de impacto, subtítulo, meta tag SEO e imagem principal do topo.
        </p>
      </div>

      <HeroClient initialSettings={settings} />
    </div>
  );
}
