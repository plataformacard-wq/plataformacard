import { getLandingSettings } from "../actions";
import { RodapeClient } from "./RodapeClient";

export const metadata = {
  title: "Rodapé & Redes | CMS QG",
};

export default async function RodapePage() {
  const settings = await getLandingSettings();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)]">
          6. Rodapé & Redes Sociais
        </h1>
        <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
          Gerencie os canais de contato, e-mail de suporte e links de redes sociais exibidos no footer.
        </p>
      </div>

      <RodapeClient initialSettings={settings} />
    </div>
  );
}
