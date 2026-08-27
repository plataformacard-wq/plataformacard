import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, items, notes } = body;

    if (!token || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Token de acesso B2B e itens do pedido são obrigatórios.' }, { status: 400 });
    }

    // 1. Validar cliente B2B
    const { data: client, error: clientErr } = await supabase
      .from('b2b_clients')
      .select('*')
      .eq('access_token', token)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ success: false, error: 'Cliente B2B não encontrado ou token inválido.' }, { status: 404 });
    }

    if (client.status !== 'approved') {
      return NextResponse.json({ success: false, error: 'Sua conta B2B está em análise de ofertas e tabelas pelo gestor.' }, { status: 403 });
    }

    const organizationId = client.organization_id;

    // 2. Calcular valor total do pedido com base nos itens recebidos
    let totalAmount = 0;
    const formattedItems = items.map((item: any) => {
      const qty = parseInt(item.quantity || 1, 10);
      const unitPrice = parseFloat(item.price || 0);
      totalAmount += qty * unitPrice;

      return {
        sku: item.sku,
        name: item.name,
        quantity: qty,
        unit_price: unitPrice,
        subtotal: qty * unitPrice
      };
    });

    // 3. Salvar o pedido no banco de dados da PlataformaShop
    let order: any = null;
    let orderErr: any = null;

    const initialInsert = await supabase
      .from('b2b_orders')
      .insert({
        organization_id: organizationId,
        b2b_client_id: client.id,
        price_key_used: client.assigned_price_key,
        items: formattedItems,
        total_amount: totalAmount,
        notes: notes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (initialInsert.error && initialInsert.error.message?.includes('notes')) {
      // Fallback sem a coluna notes caso a migração ainda esteja sendo propagada
      const fallbackInsert = await supabase
        .from('b2b_orders')
        .insert({
          organization_id: organizationId,
          b2b_client_id: client.id,
          price_key_used: client.assigned_price_key,
          items: formattedItems,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single();
      
      order = fallbackInsert.data;
      orderErr = fallbackInsert.error;
    } else {
      order = initialInsert.data;
      orderErr = initialInsert.error;
    }

    if (orderErr) {
      return NextResponse.json({ success: false, error: `Erro ao salvar pedido: ${orderErr.message}` }, { status: 500 });
    }

    // 4. Tentar enviar o pedido para a API v3 do Bling ERP (se a org tiver credenciais)
    let blingOrderId: string | null = null;
    let blingStatusMessage = 'Pedido salvo no sistema com sucesso.';

    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('bling_access_token, bling_refresh_token, bling_token_expires_at')
        .eq('id', organizationId)
        .single();

      if (org && org.bling_access_token) {
        let accessToken = org.bling_access_token;
        const expiresAt = new Date(org.bling_token_expires_at || 0);

        // Renovar token se expirado
        if (expiresAt <= new Date() && org.bling_refresh_token) {
          const clientId = process.env.BLING_CLIENT_ID;
          const clientSecret = process.env.BLING_CLIENT_SECRET;

          if (clientId && clientSecret) {
            const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const tokenResponse = await fetch("https://www.bling.com.br/Api/v3/oauth/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`,
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: org.bling_refresh_token,
              }).toString(),
            });

            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              accessToken = tokenData.access_token;

              const newExpiresAt = new Date();
              newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokenData.expires_in);

              await supabase.from("organizations").update({
                bling_access_token: tokenData.access_token,
                bling_refresh_token: tokenData.refresh_token,
                bling_token_expires_at: newExpiresAt.toISOString(),
              }).eq("id", organizationId);
            }
          }
        }

        // Criar payload do Pedido de Venda para API v3 do Bling
        const blingPayload = {
          data: new Date().toISOString().split('T')[0],
          contato: {
            nome: client.company_name,
            tipoPessoa: client.cnpj_cpf.length > 11 ? 'J' : 'F',
            numeroDocumento: client.cnpj_cpf,
            telefone: client.phone_whatsapp
          },
          itens: formattedItems.map(it => ({
            codigo: it.sku,
            descricao: it.name,
            quantidade: it.quantity,
            valor: it.unit_price
          })),
          observacoes: `Pedido B2B via PlataformaShop (Tabela: ${client.assigned_price_key.toUpperCase()}). ${notes || ''}`
        };

        const blingRes = await fetch("https://www.bling.com.br/Api/v3/pedidos/vendas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify(blingPayload)
        });

        if (blingRes.ok) {
          const blingData = await blingRes.json();
          blingOrderId = blingData.data?.id?.toString() || 'OK';

          await supabase.from('b2b_orders').update({
            bling_order_id: blingOrderId,
            status: 'sent_to_bling'
          }).eq('id', order.id);

          blingStatusMessage = 'Pedido de Venda enviado com sucesso para o Bling ERP!';
        } else {
          console.warn('Alerta Bling ERP HTTP:', blingRes.status);
          blingStatusMessage = 'Pedido salvo no sistema (Aguardando aprovação manual no Bling).';
        }
      }
    } catch (bErr) {
      console.error('Falha ao comunicar com API do Bling:', bErr);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      blingOrderId,
      totalAmount,
      message: blingStatusMessage
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
