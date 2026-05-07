import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function trackAnalyticsEvent({
  profileId,
  eventType,
  pageType,
  visitorId,
  catalogId = null,
  productId = null,
  organizationId = null,
  referrer,
  userAgent,
  metadata = {},
}: {
  profileId: string;
  eventType: string;
  pageType: string;
  visitorId?: string;
  catalogId?: string | null;
  productId?: string | null;
  organizationId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    const safeVisitorId =
      visitorId ??
      (typeof window !== "undefined"
        ? window.localStorage.getItem("VISITOR_ID")
        : null);

    const safeReferrer =
      referrer ??
      (typeof document !== "undefined" ? document.referrer : null);

    const safeUserAgent =
      userAgent ??
      (typeof navigator !== "undefined" ? navigator.userAgent : null);

    if (!profileId) {
      console.warn("⚠️ profileId não definido — analytics não enviado");
      return;
    }

    const { error } = await supabase.from("analytics_events").insert({
      profile_id: profileId,
      event_type: eventType,
      page_type: pageType,
      visitor_id: safeVisitorId || "",
      catalog_id: catalogId ?? null,
      product_id: productId ?? null,
      organization_id: organizationId ?? null,
      referrer: safeReferrer || "",
      user_agent: safeUserAgent || "",
      metadata: metadata ?? {},
    });

    if (error) {
      console.warn("Erro ao registrar evento de analytics:");
      console.warn("message:", error.message);
      console.warn("details:", error.details);
      console.warn("hint:", error.hint);
      console.warn("full:", error);
    }
  } catch (error) {
    console.warn("Erro inesperado ao registrar analytics:", error);
  }
}