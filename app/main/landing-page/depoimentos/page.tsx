import { getTestimonials, getLandingSettings } from "../actions";
import { DepoimentosClient } from "./DepoimentosClient";

export const metadata = {
  title: "Depoimentos & Métricas | CMS QG",
};

export default async function DepoimentosPage() {
  const [testimonials, settings] = await Promise.all([
    getTestimonials(),
    getLandingSettings()
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)]">
          3. Depoimentos & Métricas (Prova Social)
        </h1>
        <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
          Gerencie depoimentos de clientes e números base de audiência/catálogos.
        </p>
      </div>

      <DepoimentosClient initialTestimonials={testimonials} initialSettings={settings} />
    </div>
  );
}
