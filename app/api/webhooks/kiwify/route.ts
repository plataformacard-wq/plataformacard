import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Instância estritamente com Service Role para operações administrativas
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Configuração de backend crítica: SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }
  return createClient(url, serviceKey);
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

    // Validação de segurança do Webhook
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
    } else {
      console.warn("⚠️ ALERTA DE SEGURANÇA: KIWIFY_WEBHOOK_SECRET não configurado nas variáveis de ambiente.");
    }

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Kiwify payload extraction
    const orderStatus = payload?.order_status || payload?.status;
    const customerEmail = payload?.Customer?.email || payload?.email;
    const planName = payload?.Product?.product_name || payload?.plan_name || "pro";

    console.log(`Webhook Kiwify Recebido: Status=${orderStatus}, Email=${customerEmail}, Plano=${planName}`);

    if (orderStatus === "paid" || orderStatus === "approved" || orderStatus === "active") {
      if (customerEmail) {
        const supabase = getAdminSupabase();

        // Localiza o perfil pelo e-mail
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, organization_id")
          .eq("email", customerEmail.toLowerCase().trim())
          .maybeSingle();

        if (profile?.organization_id) {
          // Atualiza a organização com o status de assinatura ativo
          await supabase
            .from("organizations")
            .update({
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.organization_id);

          console.log(`Assinatura ativada com sucesso para a organização ${profile.organization_id}`);
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("Erro crítico no Webhook Kiwify:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

