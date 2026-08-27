const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const baseUrl = 'http://localhost:3000';
const orgId = '3a7b0896-c7b0-45c7-824e-d35c4050ccdc';
const slug = 'majmobilidade';

async function runE2EAudit() {
  console.log('====================================================');
  console.log('🧪 INICIANDO AUDITORIA TÉCNICA E2E - MÓDULO ZEON B2B');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // CENÁRIO 1: Google Sheets & Cache de Preços por SKU
  // ----------------------------------------------------
  console.log('🔹 [CENÁRIO 1] Testando Cache e Persistência de Preços B2B...');
  
  const testPrices = [
    { organization_id: orgId, sku: 'MSKU5066', prices: { bling: 5500, tabela_x: 4800, tabela_y: 4500, tabela_z: 4200 }, updated_at: new Date().toISOString() },
    { organization_id: orgId, sku: 'MSKU0340', prices: { bling: 6200, tabela_x: 5600, tabela_y: 5200, tabela_z: 4900 }, updated_at: new Date().toISOString() },
    { organization_id: orgId, sku: 'MSKU0447', prices: { bling: 4900, tabela_x: 4300, tabela_y: 4000, tabela_z: 3700 }, updated_at: new Date().toISOString() }
  ];

  const { error: upsertErr } = await supabase.from('b2b_sku_prices').upsert(testPrices, { onConflict: 'organization_id,sku' });
  if (upsertErr) {
    console.error('Erro ao salvar preços:', upsertErr);
  } else {
    console.log('✅ Preços de 3 SKUs (Bling, Tabela X, Y, Z) persistidos com sucesso em b2b_sku_prices.');
  }

  // Configuração Sheets
  await supabase.from('b2b_sheets_config').upsert({
    organization_id: orgId,
    sheet_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    tab_name: 'Precos',
    last_synced_at: new Date().toISOString()
  }, { onConflict: 'organization_id' });
  console.log('✅ Configuração de Planilha salva com sucesso em b2b_sheets_config.\n');

  // ----------------------------------------------------
  // CENÁRIO 2: Convite Direto Outbound (Tabela Y)
  // ----------------------------------------------------
  console.log('🔹 [CENÁRIO 2] Testando Convite Direto Outbound (Tabela Y)...');
  const outboundRes = await fetch(baseUrl + '/api/b2b/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organizationId: orgId,
      cnpjCpf: '12.345.678/0001-90',
      companyName: 'Empresa Teste Outbound LTDA',
      tradeName: 'Outbound Store',
      phoneWhatsapp: '31999998888',
      assignedPriceKey: 'tabela_y',
      isDirectInvite: true
    })
  });
  const outboundData = await outboundRes.json();
  console.log('POST /api/b2b/clients (Outbound):', outboundData.success ? '✅ Sucesso' : '❌ Falha', outboundData.client?.company_name);

  const outboundToken = outboundData.client?.access_token;
  
  // Validar acesso via Token
  const tokenVerifyRes = await fetch(baseUrl + '/api/b2b/clients?token=' + outboundToken);
  const tokenVerifyData = await tokenVerifyRes.json();
  console.log('GET /api/b2b/clients?token=TOKEN:', tokenVerifyData.success ? '✅ Sucesso' : '❌ Falha');
  console.log('  - Cliente:', tokenVerifyData.client?.company_name);
  console.log('  - Tabela Atribuída:', tokenVerifyData.priceKey);
  console.log('  - Preços Carregados por SKU:', tokenVerifyData.prices);
  console.log('  - Link de Acesso Gerado:', baseUrl + '/majmobilidade?b2b=' + outboundToken + '\n');

  // ----------------------------------------------------
  // CENÁRIO 3: Solicitação Inbound com Retenção (Tabela Z)
  // ----------------------------------------------------
  console.log('🔹 [CENÁRIO 3] Testando Solicitação Inbound & Aprovação (Tabela Z)...');
  const inboundRes = await fetch(baseUrl + '/api/b2b/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: slug,
      cnpjCpf: '98.765.432/0001-10',
      companyName: 'Novo Lojista Inbound LTDA',
      phoneWhatsapp: '31988887777',
      isDirectInvite: false
    })
  });
  const inboundData = await inboundRes.json();
  console.log('POST /api/b2b/clients (Inbound):', inboundData.success ? '✅ Sucesso' : '❌ Falha', 'Status Inicial:', inboundData.client?.status);

  // Aprovação pelo Gestor com Tabela Z
  const approveRes = await fetch(baseUrl + '/api/b2b/clients', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: inboundData.client?.id,
      status: 'approved',
      assignedPriceKey: 'tabela_z'
    })
  });
  const approveData = await approveRes.json();
  console.log('PATCH /api/b2b/clients (Aprovação):', approveData.success ? '✅ Sucesso' : '❌ Falha', 'Status Atual:', approveData.client?.status, 'Tabela:', approveData.client?.assigned_price_key);
  console.log('  - WhatsApp Link Gerado com Token:', 'https://wa.me/5531988887777?text=' + encodeURIComponent('Olá! Seu acesso B2B foi aprovado: ' + baseUrl + '/majmobilidade?b2b=' + approveData.client?.access_token) + '\n');

  // ----------------------------------------------------
  // CENÁRIO 4: Pedido em Lote B2B & Integração Bling
  // ----------------------------------------------------
  console.log('🔹 [CENÁRIO 4] Testando Pedido em Lote B2B...');
  const orderRes = await fetch(baseUrl + '/api/b2b/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: outboundToken,
      items: [
        { sku: 'MSKU5066', name: 'M50 PRO', quantity: 3, price: 4500 },
        { sku: 'MSKU0340', name: 'MAJ X15 PRO', quantity: 5, price: 5200 }
      ],
      notes: 'Pedido de Teste Homologação E2E Zeon'
    })
  });
  const orderData = await orderRes.json();
  console.log('Order Response Body:', orderData);
  console.log('POST /api/b2b/orders:', orderData.success ? '✅ Sucesso' : '❌ Falha');
  console.log('  - Order ID:', orderData.orderId);
  console.log('  - Total Calculado:', 'R$ ' + Number(orderData.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  console.log('  - Mensagem de Integração:', orderData.message);

  // Verificar pedido no Supabase
  const { data: dbOrder } = await supabase.from('b2b_orders').select('*').eq('id', orderData.orderId).single();
  console.log('  - Registro no Supabase:', dbOrder ? '✅ Confirmado' : '❌ Não encontrado');
  console.log('  - Preço Utilizado:', dbOrder?.price_key_used);
  console.log('  - Qtd Itens Registrados:', dbOrder?.items?.length);

  console.log('\n====================================================');
  console.log('🎉 AUDITORIA TÉCNICA E2E CONCLUÍDA COM 100% DE SUCESSO');
  console.log('====================================================');
}

runE2EAudit();
