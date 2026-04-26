const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Função simples para ler .env.local manualmente
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

loadEnv();

async function checkSellers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Erro: Variáveis de ambiente não encontradas.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log("--- BUSCANDO VENDEDORES ---");
  const { data: sellers, error: sError } = await supabase
    .from('profiles')
    .select('id, full_name, role, organization_id, slug')
    .eq('role', 'seller');

  if (sError) console.error("Erro ao buscar vendedores:", sError);
  console.log("Vendedores encontrados:", JSON.stringify(sellers, null, 2));

  console.log("\n--- BUSCANDO ID DA MAJ ---");
  const { data: maj, error: mError } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', '%Maj%')
    .single();

  if (mError) console.error("Erro ao buscar Maj:", mError);
  console.log("Maj encontrada:", maj);

  if (maj && sellers && sellers.length > 0) {
    console.log("\n--- VINCULANDO VENDEDORES À MAJ ---");
    const { error: uError } = await supabase
      .from('profiles')
      .update({ organization_id: maj.id })
      .in('id', sellers.map(s => s.id));

    if (uError) {
      console.error("Erro ao vincular:", uError);
    } else {
      console.log("Vendedores vinculados com sucesso!");
    }
  } else {
    console.log("Nenhum vendedor ou organização Maj encontrada para vincular.");
  }
}

checkSellers();
