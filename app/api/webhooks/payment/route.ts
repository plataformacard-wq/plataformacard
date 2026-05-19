import { NextResponse } from 'next/server';
import { updateOrganizationPlan } from '@/lib/admin-actions';
// import crypto from 'crypto';

/**
 * Esqueleto da Rota de Webhook para Pagamentos
 * Esta rota será chamada pelo Gateway de Pagamentos (Stripe, Kiwify, Mercado Pago)
 * quando uma assinatura for criada, renovada ou cancelada.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    // Exemplo de como validar a assinatura do webhook (comum no Stripe/Kiwify)
    // const signature = request.headers.get('webhook-signature');
    // if (!isValidSignature(body, signature, process.env.WEBHOOK_SECRET)) {
    //   return NextResponse.json({ error: 'Assinatura Inválida' }, { status: 401 });
    // }

    const event = JSON.parse(body);

    // Exemplo de mapeamento de eventos
    if (event.type === 'checkout.session.completed' || event.type === 'subscription_created') {
      
      // O orgId geralmente é passado via metadata na criação do link de pagamento
      const orgId = event.data.object.metadata?.org_id;
      const productOrPlanCode = event.data.object.plan?.id || event.data.object.product_id;

      if (!orgId) {
        console.error("Webhook recebido, mas sem orgId no metadata.");
        return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
      }

      // 1. Mapear o código do produto/plano do Gateway para os IDs do nosso Banco
      let internalPlanId = null;
      if (productOrPlanCode === 'prod_basic_100') {
        internalPlanId = "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62"; // BASIC
      } else if (productOrPlanCode === 'prod_enterprise_0') {
        internalPlanId = "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26"; // ENTERPRISE
      } else {
        internalPlanId = "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0"; // START (Fallback)
      }

      // 2. Atualiza a organização automaticamente
      const result = await updateOrganizationPlan(orgId, internalPlanId);
      
      if (result.error) {
        console.error("Falha ao atualizar plano via webhook:", result.error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
      }

      console.log(`✅ [WEBHOOK] Plano da Organização ${orgId} atualizado para ${internalPlanId}`);
      return NextResponse.json({ received: true, status: 'success' });
    }

    // Se for cancelamento de assinatura (downgrade para Free/Start)
    if (event.type === 'customer.subscription.deleted') {
      const orgId = event.data.object.metadata?.org_id;
      if (orgId) {
        const fallbackPlanId = "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0"; // START
        await updateOrganizationPlan(orgId, fallbackPlanId);
        console.log(`⚠️ [WEBHOOK] Assinatura cancelada. Org ${orgId} sofreu downgrade para START.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no processamento do webhook:", error);
    return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
  }
}
