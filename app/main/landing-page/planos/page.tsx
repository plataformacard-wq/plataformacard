import { getPlans } from "../actions";
import { PlansTable } from "../PlansTable";

export const metadata = {
  title: "Planos & Preços | CMS QG",
};

export default async function PlanosPage() {
  const plans = await getPlans();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)]">
          4. Planos & Preços (Studio de Planos)
        </h1>
        <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
          Gerencie os planos comerciais da plataforma, links do checkout Kiwify e preços de ancoragem com preview em 3 colunas ao vivo.
        </p>
      </div>

      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm">
        <PlansTable initialData={plans} />
      </div>
    </div>
  );
}
