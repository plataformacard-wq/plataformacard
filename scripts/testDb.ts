import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { syncBlingStock } from "../app/dashboard/catalogo/actions/bling";

dotenv.config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  // Pegar tokens da org
  const orgId = '3a7b0896-c7b0-45c7-824e-d35c4050ccdc';
  const { data: org } = await supabase.from('organizations').select('bling_access_token').eq('id', orgId).single();
  if (!org || !org.bling_access_token) return console.log("Sem token");

  // Buscar todos os produtos com SKU dessa org
  const { data: products } = await supabase
    .from('products')
    .select('id, sku')
    .eq('organization_id', orgId)
    .not('sku', 'is', null)
    .neq('sku', '');

  if (!products || products.length === 0) return console.log("Nenhum produto com SKU");

  console.log(`Encontrados ${products.length} produtos para sincronizar.`);

  for (const product of products) {
    if (!product.sku) continue;
    console.log(`Sincronizando ${product.sku}...`);
    
    const res = await fetch(`https://www.bling.com.br/Api/v3/produtos?codigo=${product.sku}`, {
      headers: { "Authorization": `Bearer ${org.bling_access_token}` }
    });
    
    if (!res.ok) {
      console.log(`Falha ao buscar ${product.sku} no Bling`);
      continue;
    }

    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const blingId = data.data[0].id;
      const saldoRes = await fetch(`https://www.bling.com.br/Api/v3/estoques/saldos?idsProdutos[]=${blingId}`, {
        headers: { "Authorization": `Bearer ${org.bling_access_token}` }
      });
      
      if (!saldoRes.ok) continue;
      
      const saldoData = await saldoRes.json();
      if (saldoData.data && saldoData.data.length > 0) {
        const saldoFisico = saldoData.data[0].saldoFisicoTotal || 0;
        await supabase.from("products").update({ 
          stock_quantity: saldoFisico,
          is_in_stock: saldoFisico > 0 
        }).eq('id', product.id);
        console.log(`${product.sku}: ${saldoFisico} unidades`);
      }
    } else {
      console.log(`Produto ${product.sku} não encontrado no Bling`);
    }
  }
  console.log("Sincronização finalizada!");
}

run();
