import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }
  return createClient(url, serviceKey);
}

const PLAN_UUID_MAP: Record<string, string> = {
  starter: "a1b2c3d4-e5f6-4a1b-8c9d-0e1f2a3b4c5d",
  pro: "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62",
  sales_team: "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0",
  all_service: "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26",
};

/**
/api/webhooks/kiwify/test
Exemplo: /api/webhooks/kiwify/test?org_id=UUID&action=approve&plan=pro
Exemplo: /api/webhooks/kiwify/test?org_id=UUID&action=cancel
*/
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("secret");
    if (token !== process.env.KIWIFY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Forbidden in production without valid secret" }, { status: 403 });
    }
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("org_id");
  const action = searchParams.get("action") || "approve"; // approve | cancel
  const planSlug = searchParams.get("plan") || "pro";

  if (!orgId) {
    return NextResponse.json(
      {
        error: "Parâmetro 'org_id' é obrigatório para o teste.",
        usage: "/api/webhooks/kiwify/test?org_id=SEU_ORG_ID&action=approve&plan=pro",
      },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();

  if (action === "approve") {
    const targetPlanId = PLAN_UUID_MAP[planSlug] || PLAN_UUID_MAP.pro;

    const basePayload: Record<string, any> = {
      plan_id: targetPlanId,
      updated_at: new Date().toISOString(),
    };

    let { data: org, error } = await supabase
      .from("organizations")
      .update({
        ...basePayload,
        subscription_status: "active",
      })
      .eq("id", orgId)
      .select("id, name, plan_id")
      .maybeSingle();

    // Fallback gracioso caso a coluna subscription_status ainda não tenha sido criada no Supabase SQL
    if (error && error.message.includes("subscription_status")) {
      const fallbackRes = await supabase
        .from("organizations")
        .update(basePayload)
        .eq("id", orgId)
        .select("id, name, plan_id")
        .maybeSingle();
      org = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "✅ Teste de Webhook Aprovado simulado com sucesso!",
      organization: org,
      plan_activated: planSlug,
    });
  } else if (action === "cancel") {
    const basePayload: Record<string, any> = {
      plan_id: PLAN_UUID_MAP.starter,
      updated_at: new Date().toISOString(),
    };

    let { data: org, error } = await supabase
      .from("organizations")
      .update({
        ...basePayload,
        subscription_status: "canceled",
      })
      .eq("id", orgId)
      .select("id, name, plan_id")
      .maybeSingle();

    if (error && error.message.includes("subscription_status")) {
      const fallbackRes = await supabase
        .from("organizations")
        .update(basePayload)
        .eq("id", orgId)
        .select("id, name, plan_id")
        .maybeSingle();
      org = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "⚠️ Teste de Webhook Cancelado simulado com sucesso!",
      organization: org,
    });
  }

  return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 });
}
