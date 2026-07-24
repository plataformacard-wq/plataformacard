export type FeatureKey =
  | "ai_seo"
  | "bling_sync"
  | "custom_domain"
  | "sales_team"
  | "caas_master";

export type PlanSlug = "starter" | "pro" | "sales_team" | "all_service";

export interface PlanDefinition {
  slug: PlanSlug;
  name: string;
  badgeText?: string;
  monthlyAnchor: number; // Preço original riscado (Ex: 89.90)
  monthlyPrice: number;  // Preço normal mensal (Ex: 59.90)
  annualPrice: number;   // Preço com desconto anual por mês (Ex: 39.90)
  annualDiscountValue: number; // Desconto OFF/mês no anual (Ex: 20.00)
  allowedFeatures: FeatureKey[];
  maxProducts: number;
  maxUsers: number;
  checkoutUrls?: {
    monthly: string;
    annual: string;
  };
}

export const PLANS: Record<PlanSlug, PlanDefinition> = {
  starter: {
    slug: "starter",
    name: "Starter",
    monthlyAnchor: 89.90,
    monthlyPrice: 59.90,
    annualPrice: 39.90,
    annualDiscountValue: 20.00,
    allowedFeatures: [],
    maxProducts: 100,
    maxUsers: 1,
    checkoutUrls: {
      monthly: "https://pay.kiwify.com.br/o58QqJP",
      annual: "https://pay.kiwify.com.br/JYPy0Ec",
    },
  },
  pro: {
    slug: "pro",
    name: "PRO",
    badgeText: "Recomendado",
    monthlyAnchor: 229.90,
    monthlyPrice: 149.90,
    annualPrice: 99.90,
    annualDiscountValue: 50.00,
    allowedFeatures: ["ai_seo", "bling_sync", "custom_domain"],
    maxProducts: 1000,
    maxUsers: 3,
    checkoutUrls: {
      monthly: "https://pay.kiwify.com.br/exQ3L5T",
      annual: "https://pay.kiwify.com.br/H8G4uuU",
    },
  },
  sales_team: {
    slug: "sales_team",
    name: "Sales Team",
    badgeText: "Corporativo",
    monthlyAnchor: 449.90,
    monthlyPrice: 299.90,
    annualPrice: 199.90,
    annualDiscountValue: 100.00,
    allowedFeatures: ["ai_seo", "bling_sync", "custom_domain", "sales_team", "caas_master"],
    maxProducts: 5000,
    maxUsers: 10,
    checkoutUrls: {
      monthly: "https://pay.kiwify.com.br/LkBViNa",
      annual: "https://pay.kiwify.com.br/DcSyq23",
    },
  },
  all_service: {
    slug: "all_service",
    name: "Franqueador",
    badgeText: "Enterprise",
    monthlyAnchor: 699.90,
    monthlyPrice: 499.90,
    annualPrice: 349.90,
    annualDiscountValue: 150.00,
    allowedFeatures: ["ai_seo", "bling_sync", "custom_domain", "sales_team", "caas_master"],
    maxProducts: 99999,
    maxUsers: 99,
    checkoutUrls: {
      monthly: "https://pay.kiwify.com.br/LkBViNa",
      annual: "https://pay.kiwify.com.br/DcSyq23",
    },
  },
};

export function isFeatureAllowed(planSlug: string | null | undefined, feature: FeatureKey): boolean {
  if (!planSlug) return false;
  const normalized = planSlug.toLowerCase().trim().replace(/[^a-z_]/g, "") as PlanSlug;
  const plan = PLANS[normalized];
  if (!plan) return false;
  return plan.allowedFeatures.includes(feature);
}

export function getPlanDefinition(planSlug: string | null | undefined): PlanDefinition {
  if (!planSlug) return PLANS.starter;
  const normalized = planSlug.toLowerCase().trim().replace(/[^a-z_]/g, "") as PlanSlug;
  return PLANS[normalized] || PLANS.starter;
}
