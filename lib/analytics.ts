import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

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
    const isConsentAccepted = typeof window !== "undefined"
      ? window.localStorage.getItem("plataformashop-lgpd-consent") === "accepted"
      : false;

    const safeVisitorId = isConsentAccepted
      ? (visitorId ??
        (typeof window !== "undefined"
          ? window.localStorage.getItem("VISITOR_ID")
          : null))
      : null;

    const safeReferrer = isConsentAccepted
      ? (referrer ??
        (typeof document !== "undefined" ? document.referrer : null))
      : null;

    const safeUserAgent = isConsentAccepted
      ? (userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : null))
      : null;

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

export async function createAnalyticsCheckpoint({
  organizationId,
  profileId,
  name = "Reset manual",
}: {
  organizationId?: string | null;
  profileId: string;
  name?: string;
}) {
  try {
    const { data, error } = await supabase
      .from("analytics_checkpoints")
      .insert({
        organization_id: organizationId || null,
        profile_id: profileId,
        created_by: profileId,
        name,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao criar checkpoint de analytics:", error);
    return { data: null, error };
  }
}