import { 
  getLandingSettings, 
  getTestimonials, 
  getPartners,
  getFaqs,
  getPlans
} from "./actions";
import { LandingPageClient } from "./LandingPageClient";

export const metadata = {
  title: "CMS Landing Page | QG",
};

export default async function LandingPageCMS() {
  const settings = await getLandingSettings();
  const testimonials = await getTestimonials();
  const partners = await getPartners();
  const faqs = await getFaqs();
  const plans = await getPlans();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--dash-text-primary)]">
          Gerenciador da Landing Page
        </h1>
        <p className="text-[var(--dash-text-secondary)] mt-1">
          Altere textos, métricas e gerencie provas sociais exibidas na página inicial.
        </p>
      </div>

      <LandingPageClient 
        initialSettings={settings} 
        initialTestimonials={testimonials} 
        initialPartners={partners} 
        initialFaqs={faqs}
        initialPlans={plans}
      />
    </div>
  );
}
