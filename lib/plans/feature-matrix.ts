export type FeatureKey =
  | "ai_seo"
  | "bling_sync"
  | "custom_domain"
  | "sales_team"
  | "bulk_pricing"
  | "caas_master"
  | "b2b_portal";

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
    allowedFeatures: ["ai_seo", "bling_sync", "custom_domain", "sales_team", "bulk_pricing", "b2b_portal"],
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
    allowedFeatures: ["ai_seo", "bling_sync", "custom_domain", "sales_team", "bulk_pricing", "caas_master", "b2b_portal"],
    maxProducts: 99999,
    maxUsers: 99,
    checkoutUrls: {
      monthly: "https://pay.kiwify.com.br/LkBViNa",
      annual: "https://pay.kiwify.com.br/DcSyq23",
    },
  },
};

const UUID_TO_SLUG_MAP: Record<string, PlanSlug> = {
  "a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d": "starter",
  "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62": "pro",
  "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0": "sales_team",
  "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26": "all_service",
};

export function normalizePlanSlug(input?: string | null): PlanSlug {
  if (!input) return "starter";
  const trimmed = input.trim().toLowerCase();
  if (UUID_TO_SLUG_MAP[trimmed]) return UUID_TO_SLUG_MAP[trimmed];
  if (trimmed.includes("main_admin") || trimmed.includes("super_admin") || trimmed.includes("admin") || trimmed.includes("all_service") || trimmed.includes("franqueador") || trimmed.includes("enterprise") || trimmed.includes("hibrida")) return "all_service";
  if (trimmed.includes("starter") || trimmed.includes("start")) return "starter";
  if (trimmed.includes("sales") || trimmed.includes("team") || trimmed.includes("premium")) return "sales_team";
  if (trimmed.includes("pro") || trimmed.includes("basic")) return "pro";
  return "starter";
}

export function isFeatureAllowed(planIdentifier: string | null | undefined, feature: FeatureKey): boolean {
  const slug = normalizePlanSlug(planIdentifier);
  const plan = PLANS[slug];
  if (!plan) return false;
  return plan.allowedFeatures.includes(feature);
}

export function getPlanDefinition(planIdentifier: string | null | undefined): PlanDefinition {
  const slug = normalizePlanSlug(planIdentifier);
  return PLANS[slug] || PLANS.starter;
}
