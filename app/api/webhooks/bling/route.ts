import { NextResponse } from 'next/server';
import { syncBlingStock } from '@/app/dashboard/catalogo/actions/bling';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId parameter' }, { status: 400 });
    }

    // Parse the payload securely
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ received: true });
    }

    let payload;
    try {
      payload = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Tentar extrair o SKU do payload do Bling V3
    let skuToUpdate = null;

    if (payload?.data?.codigo) {
      skuToUpdate = payload.data.codigo;
    } else if (payload?.data?.retorno?.estoques?.[0]?.estoque?.codigo) {
      skuToUpdate = payload.data.retorno.estoques[0].estoque.codigo;
    } else if (typeof payload?.data === 'string') {
      try {
        const parsedData = JSON.parse(payload.data);
        if (parsedData?.retorno?.estoques?.[0]?.estoque?.codigo) {
          skuToUpdate = parsedData.retorno.estoques[0].estoque.codigo;
        }
      } catch (e) {}
    }

    if (skuToUpdate) {
      // Dispara a sincronização de estoque em background passando apenas o SKU recebido.
      // Isso evita timeout na chamada do webhook e otimiza as requisições para a API do Bling.
      syncBlingStock(orgId, skuToUpdate).catch(err => {
        console.error(`Erro ao sincronizar estoque via Webhook (SKU: ${skuToUpdate}):`, err);
      });
    } else {
      console.log('Webhook Bling: SKU não encontrado no payload. Payload:', text);
      // Se falhar em encontrar o SKU por causa de mudanças não documentadas na API V3,
      // nós acionamos um sync completo da organização, como um "fallback" de segurança.
      syncBlingStock(orgId).catch(console.error);
    }

    // O Bling espera um 2xx o mais rápido possível para confirmar o recebimento
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Erro crítico no processamento do webhook do Bling:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
