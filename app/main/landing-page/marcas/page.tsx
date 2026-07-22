import { getPartners } from "../actions";
import { PartnersTable } from "../PartnersTable";

export const metadata = {
  title: "Marcas Parceiras | CMS QG",
};

export default async function MarcasPage() {
  const partners = await getPartners();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)]">
          2. Marcas Parceiras (Prova Social)
        </h1>
        <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
          Gerencie os logotipos das marcas e empresas exibidas no carrossel de parceiros da Landing Page.
        </p>
      </div>

      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm">
        <PartnersTable initialData={partners} />
      </div>
    </div>
  );
}
