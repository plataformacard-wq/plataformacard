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

      // Mapear tabela de preço atribuída
      const priceMap: Record<string, number> = {};
      prices?.forEach(p => {
        const val = p.prices?.[client.assigned_price_key] || p.prices?.['bling'] || 0;
        if (val) priceMap[p.sku] = val;
      });

      return NextResponse.json({
        success: true,
        client,
        priceKey: client.assigned_price_key,
        prices: priceMap
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

    return NextResponse.json({ success: true, clients: clients || [] });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Criar novo cliente (Solicitação Inbound no site ou Cadastro direto no Dashboard)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, slug, cnpjCpf, companyName, tradeName, phoneWhatsapp, assignedPriceKey, isDirectInvite } = body;

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

    const { data: existing } = await supabase
      .from('b2b_clients')
      .select('*')
      .eq('organization_id', orgId)
      .eq('cnpj_cpf', cleanCnpj)
      .single();

    if (existing) {
      // Se já existe e foi solicitação inbound, atualiza para pendente se necessário
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

// PUT: Atualizar status do cliente B2B ou mudar a tabela de preço atribuída
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedPriceKey, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do cliente B2B não informado.' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (status) {
      updatePayload.status = status;
      if (status === 'approved') updatePayload.approved_at = new Date().toISOString();
    }
    if (assignedPriceKey) updatePayload.assigned_price_key = assignedPriceKey;
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
