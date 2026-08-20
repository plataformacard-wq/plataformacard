import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Configuração de backend crítica: SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }
  return createClient(url, serviceKey);
}

const PLAN_UUID_MAP = {
  starter: "a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d",
  pro: "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62",
  sales_team: "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0",
  all_service: "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26",
};

function resolvePlanId(productName?: string, productId?: string): string {
  const name = (productName || "").toLowerCase();
  const id = (productId || "").toLowerCase();

  if (name.includes("starter") || id.includes("starter") || name.includes("start")) {
    return PLAN_UUID_MAP.starter;
  }
  if (name.includes("sales") || name.includes("team") || id.includes("sales")) {
    return PLAN_UUID_MAP.sales_team;
  }
  if (name.includes("all") || name.includes("franqueador") || name.includes("enterprise") || id.includes("all")) {
    return PLAN_UUID_MAP.all_service;
  }
  return PLAN_UUID_MAP.pro;
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.KIWIFY_WEBHOOK_SECRET;
    const { searchParams } = new URL(req.url);
    const signature = searchParams.get("signature") || req.headers.get("x-kiwify-signature");

    const text = await req.text();
    if (!text) {
      return NextResponse.json({ received: true });
    }

    if (webhookSecret) {
      if (!signature) {
        console.error("🔒 Webhook Kiwify rejeitado: Assinatura/Signature ausente na requisição.");
        return NextResponse.json({ error: "Unauthorized: Missing signature" }, { status: 401 });
      }

      const calculatedSignature = crypto
        .createHmac("sha1", webhookSecret)
        .update(text)
        .digest("hex");

      if (signature !== calculatedSignature && signature !== webhookSecret) {
        console.error("🔒 Webhook Kiwify rejeitado: Assinatura inválida.");
        return NextResponse.json({ error: "Unauthorized: Invalid signature" }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const orderStatus = payload?.order_status || payload?.status || payload?.event;
    const customerEmail = payload?.Customer?.email || payload?.email;
    const productName = payload?.Product?.product_name || payload?.plan_name || payload?.product_name;
    const productId = payload?.Product?.product_id || payload?.product_id;

    let orgId =
      searchParams.get("org_id") ||
      payload?.custom_variables?.org_id ||
      payload?.tracking_parameters?.s1 ||
      payload?.s1 ||
      payload?.s2;

    const supabase = getAdminSupabase();

    if (!orgId && customerEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, organization_id")
        .eq("email", customerEmail.toLowerCase().trim())
        .maybeSingle();

      if (profile?.organization_id) {
        orgId = profile.organization_id;
      }
    }

    if (!orgId) {
      return NextResponse.json({ received: true, warning: "Organization not found for this purchase" });
    }

    const isApproval =
      orderStatus === "paid" ||
      orderStatus === "approved" ||
      orderStatus === "active" ||
      orderStatus === "order_approved" ||
      orderStatus === "subscription_renewed";

    const isCancellation =
      orderStatus === "refunded" ||
      orderStatus === "charged_back" ||
      orderStatus === "canceled" ||
      orderStatus === "subscription_canceled";

    if (isApproval) {
      const targetPlanId = resolvePlanId(productName, productId);

      const basePayload: Record<string, any> = {
        plan_id: targetPlanId,
        updated_at: new Date().toISOString(),
      };

      let { error: updateErr } = await supabase
        .from("organizations")
        .update({
          ...basePayload,
          subscription_status: "active",
        })
        .eq("id", orgId);

      if (updateErr && updateErr.message.includes("subscription_status")) {
        const fallbackRes = await supabase
          .from("organizations")
          .update(basePayload)
          .eq("id", orgId);
        updateErr = fallbackRes.error;
      }

      if (updateErr) {
        return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: "active", orgId, planId: targetPlanId });
    }

    if (isCancellation) {
      const basePayload: Record<string, any> = {
        plan_id: PLAN_UUID_MAP.starter,
        updated_at: new Date().toISOString(),
      };

      let { error: updateErr } = await supabase
        .from("organizations")
        .update({
          ...basePayload,
          subscription_status: "canceled",
        })
        .eq("id", orgId);

      if (updateErr && updateErr.message.includes("subscription_status")) {
        const fallbackRes = await supabase
          .from("organizations")
          .update(basePayload)
          .eq("id", orgId);
        updateErr = fallbackRes.error;
      }

      if (updateErr) {
        return NextResponse.json({ error: "Failed to downgrade organization" }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: "canceled", orgId });
    }

    return NextResponse.json({ success: true, received: true, info: "No action required" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
