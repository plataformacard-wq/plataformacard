import { getFaqs } from "../actions";
import { FaqsTable } from "../FaqsTable";

export const metadata = {
  title: "Perguntas (FAQ) | CMS QG",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)]">
          5. Perguntas Frequentes (FAQ)
        </h1>
        <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
          Gerencie a lista de perguntas e respostas exibidas na seção de FAQ da Landing Page.
        </p>
      </div>

      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm">
        <FaqsTable initialData={faqs} />
      </div>
    </div>
  );
}
