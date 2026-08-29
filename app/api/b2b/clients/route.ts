import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET: Buscar cliente por token de acesso ou listar clientes da organização
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const organizationId = searchParams.get('organizationId');
    const slug = searchParams.get('slug');

    // Se passou token, busca o cliente B2B correspondente
    if (token) {
      const { data: client, error } = await supabase
        .from('b2b_clients')
        .select('*')
        .eq('access_token', token)
        .single();

      if (error || !client) {
        return NextResponse.json({ success: false, error: 'Acesso B2B inválido ou não encontrado.' }, { status: 404 });
      }

      // Buscar preços aplicáveis da organização
      const { data: prices } = await supabase
        .from('b2b_sku_prices')
        .select('sku, prices')
        .eq('organization_id', client.organization_id);

      // Mapear tabela de preço atribuída com resolução inteligente
      const priceMap: Record<string, number> = {};
      prices?.forEach(p => {
        const pPrices = p.prices || {};
        let val = pPrices[client.assigned_price_key];
        
        if (!val) {
          if (client.assigned_price_key === 'valor_1' || client.assigned_price_key === 'tabela_x') {
            val = pPrices['atacado'] || pPrices['valor_1'] || pPrices['tabela_x'] || pPrices['varejo'];
          } else if (client.assigned_price_key === 'valor_2' || client.assigned_price_key === 'tabela_y') {
            val = pPrices['valor_2'] || pPrices['tabela_y'] || pPrices['atacado'];
          } else if (client.assigned_price_key === 'valor_3' || client.assigned_price_key === 'tabela_z') {
            val = pPrices['valor_3'] || pPrices['tabela_z'];
          } else if (client.assigned_price_key === 'valor_4') {
            val = pPrices['valor_4'];
          } else if (client.assigned_price_key === 'atacado') {
            val = pPrices['atacado'] || pPrices['valor_1'] || pPrices['tabela_x'];
          } else if (client.assigned_price_key === 'varejo') {
            val = pPrices['varejo'] || pPrices['bling'];
          }
        }
        
        // Fallback para qualquer preço válido registrado
        if (!val) {
          const availableValues = Object.values(pPrices).filter(v => typeof v === 'number' && v > 0) as number[];
          if (availableValues.length > 0) {
            val = availableValues[0];
          }
        }

        if (val && Number(val) > 0) {
          priceMap[p.sku] = Number(val);
        }
      });

      // Buscar configurações da organização para obter percentual de ancoragem padrão
      const { data: sheetConfig } = await supabase
        .from('b2b_sheets_config')
        .select('custom_tables, default_anchor_percent')
        .eq('organization_id', client.organization_id)
        .maybeSingle();

      const defaultMarkup = sheetConfig?.default_anchor_percent !== null && sheetConfig?.default_anchor_percent !== undefined 
        ? Number(sheetConfig.default_anchor_percent) 
        : 30;

      const effectiveMarkup = (client.anchor_percent !== null && client.anchor_percent !== undefined)
        ? Number(client.anchor_percent)
        : defaultMarkup;

      // Mapear preços de ancoragem dinamicamente via Markup % sobre o preço B2B do cliente
      const anchorMap: Record<string, number> = {};
      Object.entries(priceMap).forEach(([sku, b2bPrice]) => {
        if (b2bPrice && b2bPrice > 0) {
          anchorMap[sku] = Number((b2bPrice * (1 + effectiveMarkup / 100)).toFixed(2));
        }
      });

      return NextResponse.json({
        success: true,
        client,
        priceKey: client.assigned_price_key,
        anchorPercent: effectiveMarkup,
        isCustomAnchor: client.anchor_percent !== null,
        prices: priceMap,
        anchorPrices: anchorMap
      });
    }

    // Se passou organizationId ou slug, listar clientes no Dashboard
    let orgId = organizationId;
    if (!orgId && slug) {
      const { data: org } = await supabase.from('organizations').select('id').eq('slug', slug).single();
      if (org) orgId = org.id;
    }

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Parâmetro token ou organizationId/slug é necessário.' }, { status: 400 });
    }

    const { data: clients, error } = await supabase
      .from('b2b_clients')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: sheetConfig } = await supabase
      .from('b2b_sheets_config')
      .select('custom_tables, default_anchor_percent')
      .eq('organization_id', orgId)
      .maybeSingle();

    return NextResponse.json({ 
      success: true, 
      clients: clients || [],
      customTables: sheetConfig?.custom_tables || [],
      defaultAnchorPercent: sheetConfig?.default_anchor_percent !== null && sheetConfig?.default_anchor_percent !== undefined ? Number(sheetConfig.default_anchor_percent) : 30
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Criar novo cliente (Solicitação Inbound no site ou Cadastro direto no Dashboard)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, slug, cnpjCpf, companyName, tradeName, phoneWhatsapp, assignedPriceKey, anchorPercent, isDirectInvite } = body;

    let orgId = organizationId;
    if (!orgId && slug) {
      const { data: org } = await supabase.from('organizations').select('id').eq('slug', slug).single();
      if (org) orgId = org.id;
    }

    if (!orgId || !cnpjCpf || !companyName || !phoneWhatsapp) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes (CNPJ, Razão Social, WhatsApp).' }, { status: 400 });
    }

    const cleanCnpj = cnpjCpf.replace(/\D/g, '');
    const status = isDirectInvite ? 'approved' : 'pending_approval';
    const priceKey = assignedPriceKey || 'tabela_x';
    const parsedAnchorPercent = (anchorPercent !== undefined && anchorPercent !== null && anchorPercent !== '') 
      ? Number(anchorPercent) 
      : null;

    const { data: existing } = await supabase
      .from('b2b_clients')
      .select('*')
      .eq('organization_id', orgId)
      .eq('cnpj_cpf', cleanCnpj)
      .single();

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        client: existing, 
        message: 'Cliente B2B já cadastrado na plataforma.',
        isExisting: true
      });
    }

    const { data: client, error } = await supabase
      .from('b2b_clients')
      .insert({
        organization_id: orgId,
        cnpj_cpf: cleanCnpj,
        company_name: companyName,
        trade_name: tradeName || companyName,
        phone_whatsapp: phoneWhatsapp,
        assigned_price_key: priceKey,
        anchor_percent: parsedAnchorPercent,
        status,
        approved_at: isDirectInvite ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, client });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Atualizar status do cliente B2B, tabela de preço ou % de ancoragem
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedPriceKey, anchorPercent, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do cliente B2B não informado.' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (status) {
      updatePayload.status = status;
      if (status === 'approved') updatePayload.approved_at = new Date().toISOString();
    }
    if (assignedPriceKey) updatePayload.assigned_price_key = assignedPriceKey;
    if (anchorPercent !== undefined) {
      updatePayload.anchor_percent = (anchorPercent === null || anchorPercent === '') ? null : Number(anchorPercent);
    }
    if (notes !== undefined) updatePayload.notes = notes;

    const { data: client, error } = await supabase
      .from('b2b_clients')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, client });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
