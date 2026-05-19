/**
 * Mapa centralizado de planos do SaaS.
 * Fonte única da verdade para limites de recursos por plano.
 * 0 = ilimitado (Enterprise).
 *
 * IMPORTANTE: Se os UUIDs dos planos mudarem no banco (tabela `plans`),
 * atualize APENAS este arquivo. Todos os componentes que usam limites
 * de plano devem importar desta constante, nunca hardcodar UUIDs.
 */
export const PLAN_IDS = {
  START:      "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0",
  BASIC:      "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62",
  ENTERPRISE: "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26",
} as const;

export interface PlanLimits {
  name: string;
  max_products: number; // 0 = ilimitado
  max_users: number;    // 0 = ilimitado
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  [PLAN_IDS.START]: {
    name: "Start",
    max_products: 20,
    max_users: 2,
  },
  [PLAN_IDS.BASIC]: {
    name: "Basic",
    max_products: 100,
    max_users: 10,
  },
  [PLAN_IDS.ENTERPRISE]: {
    name: "Enterprise",
    max_products: 0,
    max_users: 0,
  },
};

/**
 * Retorna o nome legível de um plano pelo seu UUID.
 * Fallback para "Custom" se o UUID não for reconhecido.
 */
export function getPlanName(planId: string | null | undefined): string {
  if (!planId) return "Sem Plano";
  return PLAN_LIMITS[planId]?.name ?? "Custom";
}

/**
 * Detecta conflitos de recursos quando um plano é alterado.
 * Retorna lista de conflitos (recurso, uso atual, novo limite).
 * Retorna array vazio se não houver conflitos.
 */
export function detectDowngradeConflicts(
  newPlanId: string,
  currentUsage: { products: number; sellers: number }
): { resource: string; label: string; current: number; limit: number }[] {
  const plan = PLAN_LIMITS[newPlanId];
  if (!plan) return [];

  const conflicts: { resource: string; label: string; current: number; limit: number }[] = [];

  if (plan.max_products > 0 && currentUsage.products > plan.max_products) {
    conflicts.push({
      resource: "products",
      label: "Produtos",
      current: currentUsage.products,
      limit: plan.max_products,
    });
  }

  if (plan.max_users > 0 && currentUsage.sellers > plan.max_users) {
    conflicts.push({
      resource: "sellers",
      label: "Vendedores",
      current: currentUsage.sellers,
      limit: plan.max_users,
    });
  }

  return conflicts;
}

/**
 * Detecta se um cliente está em "excedência" — uso acima do limite do plano atual.
 * Usado para exibir o banner de alerta no dashboard do cliente.
 */
export function detectOverage(
  planId: string | null | undefined,
  currentUsage: { products: number; sellers: number }
): { resource: string; label: string; current: number; limit: number }[] {
  if (!planId) return [];
  return detectDowngradeConflicts(planId, currentUsage);
}
