"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type ResourceMetrics = {
  totalSellers: number;
  totalProducts: number;
  totalLeads: number;
  totalAnalytics: number;
  totalImages: number;
  dbUsagePercent: number;
  bandwidthUsagePercent: number;
  lastUpdated: string;
};

export async function getSaaSResourceMetrics(): Promise<ResourceMetrics> {
  const admin = createAdminClient();

  // 1. Contagens Básicas
  const [
    { count: sellersCount },
    { count: productsCount },
    { count: leadsCount },
    { count: analyticsCount }
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller"),
    admin.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null),
    admin.from("leads_tracking").select("*", { count: "exact", head: true }),
    admin.from("analytics_events").select("*", { count: "exact", head: true })
  ]);

  // 2. Estimativa de Uso de Banco (500MB Free Tier)
  // Assumindo uma média de 1KB por linha (conservador)
  // 500MB = 500.000 KB = Aproximadamente 500.000 linhas
  const totalRows = (sellersCount || 0) + (productsCount || 0) + (leadsCount || 0) + (analyticsCount || 0);
  const dbLimit = 500000; 
  const dbUsagePercent = Math.min(Math.round((totalRows / dbLimit) * 100), 100);

  // 3. Estimativa de Banda (100GB Free Tier)
  // Baseado no volume de analytics (cada evento ~ 2KB de tráfego)
  const estimatedBandwidthKB = (analyticsCount || 0) * 2;
  const bandwidthLimitKB = 100 * 1024 * 1024; // 100GB
  const bandwidthUsagePercent = Math.min(Math.round((estimatedBandwidthKB / bandwidthLimitKB) * 100), 100);

  return {
    totalSellers: sellersCount || 0,
    totalProducts: productsCount || 0,
    totalLeads: leadsCount || 0,
    totalAnalytics: analyticsCount || 0,
    totalImages: productsCount || 0, // Estimativa simplificada: 1 imagem por produto
    dbUsagePercent,
    bandwidthUsagePercent,
    lastUpdated: new Date().toISOString()
  };
}
