import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

/**
 * Rota de Webhook para Pagamentos (Stripe & Kiwify)
 * Esta rota é chamada pelos gateways de pagamento.
 * Ela possui validação de assinatura criptográfica (HMAC-SHA1 para Kiwify) e validação por token secreto.
 */
export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYMENT_WEBHOOK_SECRET;

    // Proteção Fail-Safe: Se a chave secreta de webhooks não estiver configurada no servidor,
    // a rota falha por segurança em produção para evitar bypasses de R$ 0.
    if (!secretKey && process.env.NODE_ENV === 'production') {
      console.error("❌ [WEBHOOK ERROR]: PAYMENT_WEBHOOK_SECRET não está configurado no servidor.");
      return NextResponse.json({ error: 'Webhook signature key not configured' }, { status: 500 });
    }

    const body = await request.text();
    const url = new URL(request.url);

    // 1. Obter assinaturas/tokens enviados
    const kiwifySignature = request.headers.get('x-kiwify-signature');
    const querySecret = url.searchParams.get('secret');
    const bypassToken = url.searchParams.get('bypass');

    let isAuthorized = false;

    // A. Bypass para desenvolvimento local (apenas fora de produção)
    if (process.env.NODE_ENV === 'development' && bypassToken === 'true') {
      console.warn("⚠️ [WEBHOOK]: Bypass de segurança ativo no ambiente de Desenvolvimento Local.");
      isAuthorized = true;
    }

    // B. Validação 1: Token secreto na URL (Query Parameter)
    // Muito útil e 100% seguro se configurado via HTTPS
    if (!isAuthorized && secretKey && querySecret === secretKey) {
      isAuthorized = true;
    }

    // C. Validação 2: Assinatura Kiwify HMAC-SHA1 no Header
    if (!isAuthorized && secretKey && kiwifySignature) {
      try {
        const hmac = crypto.createHmac('sha1', secretKey);
        hmac.update(body);
        const computedSignature = hmac.digest('hex');

        const signatureBuffer = Buffer.from(kiwifySignature, 'utf-8');
        const computedBuffer = Buffer.from(computedSignature, 'utf-8');

        // Comparação segura contra timing attacks (evita erros se os tamanhos forem diferentes)
        if (signatureBuffer.length === computedBuffer.length) {
          isAuthorized = crypto.timingSafeEqual(computedBuffer, signatureBuffer);
        }
      } catch (err) {
        console.error("Erro na verificação HMAC da assinatura Kiwify:", err);
      }
    }

    // Se nenhuma das formas de autenticação for válida, rejeita
    if (!isAuthorized) {
      console.warn("🚫 [WEBHOOK UNAUTHORIZED]: Tentativa de chamada de webhook sem assinatura válida.");
      return NextResponse.json({ error: 'Assinatura Inválida ou Ausente' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Mapeamento dinâmico de chaves e dados para suportar Stripe e Kiwify
    const orgId = event.custom_variables?.org_id || 
                  event.data?.object?.metadata?.org_id || 
                  event.metadata?.org_id;

    const productOrPlanCode = event.product_id || 
                              event.plan?.id || 
                              event.data?.object?.plan?.id || 
                              event.data?.object?.product_id;

    if (!orgId) {
      console.error("Webhook recebido e autenticado, mas sem orgId nos metadados.");
      return NextResponse.json({ error: 'Missing orgId in metadata' }, { status: 400 });
    }

    // Verificar se o evento é uma aprovação de pagamento/assinatura
    const isApprovalEvent = 
      event.type === 'checkout.session.completed' || 
      event.type === 'subscription_created' ||
      event.order_status === 'approved' ||
      event.status === 'approved' ||
      event.event === 'order_approved';

    // Verificar se o evento é um cancelamento/estorno/reembolso
    const isCancellationEvent = 
      event.type === 'customer.subscription.deleted' ||
      event.order_status === 'refunded' ||
      event.order_status === 'charged_back' ||
      event.status === 'refunded' ||
      event.status === 'charged_back' ||
      event.event === 'subscription_canceled';

    // Para evitar falha de autenticação "Não autorizado" de verifySuperAdmin,
    // fazemos a atualização direta no banco de dados com createAdminClient (Service Role Key)
    const supabase = createAdminClient();

    if (isApprovalEvent) {
      // Mapear o código do produto do Gateway para os IDs internos do Banco
      let internalPlanId = null;
      if (productOrPlanCode === 'prod_basic_100') {
        internalPlanId = "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62"; // BASIC
      } else if (productOrPlanCode === 'prod_enterprise_0') {
        internalPlanId = "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26"; // ENTERPRISE
      } else {
        internalPlanId = "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0"; // START / PRO (Fallback)
      }

      const { error: dbError } = await supabase
        .from("organizations")
        .update({ plan_id: internalPlanId })
        .eq("id", orgId);
      
      if (dbError) {
        console.error(`Erro ao atualizar plano para a org ${orgId} via webhook:`, dbError);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
      }

      try {
        revalidatePath("/main/clientes");
      } catch (cacheErr) {
        console.warn("Erro ao revalidar cache:", cacheErr);
      }

      console.log(`✅ [WEBHOOK SUCCESS]: Plano da Org ${orgId} atualizado para ${internalPlanId}`);
      return NextResponse.json({ received: true, status: 'success' });
    }

    if (isCancellationEvent) {
      const fallbackPlanId = "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0"; // START / PRO (Downgrade)
      
      const { error: dbError } = await supabase
        .from("organizations")
        .update({ plan_id: fallbackPlanId })
        .eq("id", orgId);
      
      if (dbError) {
        console.error(`Erro ao efetuar downgrade de plano para a org ${orgId} via webhook:`, dbError);
        return NextResponse.json({ error: 'Failed to downgrade plan' }, { status: 500 });
      }

      try {
        revalidatePath("/main/clientes");
      } catch (cacheErr) {
        console.warn("Erro ao revalidar cache:", cacheErr);
      }

      console.log(`⚠️ [WEBHOOK DOWNGRADE]: Assinatura cancelada/reembolsada. Org ${orgId} alterada para START.`);
      return NextResponse.json({ received: true, status: 'downgraded' });
    }

    return NextResponse.json({ received: true, info: 'No action taken for this event type' });
  } catch (error) {
    console.error("Erro no processamento do webhook:", error);
    return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
  }
}
