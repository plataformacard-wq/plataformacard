
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

function getEnv() {
  const envFile = fs.readFileSync(".env.local", "utf8");
  const env = {};
  envFile.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim();
  });
  return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function recoverData() {
  console.log("--- BUSCANDO ORGANIZAÇÕES MAJ ---");
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, created_at")
    .ilike("name", "%Maj%");
  
  console.log("Organizações encontradas:", orgs);

  if (!orgs || orgs.length < 2) {
    console.log("Não foram encontradas múltiplas organizações Maj para migrar.");
    // Se só tiver uma, talvez os dados estejam nela mas o usuário está em outra?
    // Vamos checar o perfil do usuário 'Start'
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, organization_id, full_name')
      .ilike('full_name', '%Start%')
      .single();
    
    console.log("Perfil atual do usuário Start:", profile);
    return;
  }

  // Ordenar por data de criação para identificar a mais nova (provavelmente a vazia) e a antiga (com dados)
  const sortedOrgs = orgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const oldOrg = sortedOrgs[0];
  const newOrg = sortedOrgs[sortedOrgs.length - 1];

  console.log(`\nAntiga Org (provável fonte): ${oldOrg.name} (${oldOrg.id})`);
  console.log(`Nova Org (destino atual): ${newOrg.name} (${newOrg.id})`);

  // 1. Buscar produtos da org antiga
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("organization_id", oldOrg.id);
  
  console.log(`\nProdutos na Org Antiga: ${products?.length || 0}`);

  // 2. Buscar vendedores (perfis) da org antiga
  const { data: sellers } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("organization_id", oldOrg.id);
  
  console.log(`Vendedores na Org Antiga: ${sellers?.length || 0}`);
  if (sellers) sellers.forEach(s => console.log(`> ${s.full_name} (${s.role})`));

  // 3. Buscar categorias (via catálogo)
  const { data: catalogs } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", oldOrg.id);
  
  console.log(`Catálogos na Org Antiga: ${catalogs?.length || 0}`);

  console.log("\n--- INICIANDO MIGRAÇÃO ---");

  // Migrar Produtos
  if (products && products.length > 0) {
    const { error: pErr } = await supabase
      .from("products")
      .update({ organization_id: newOrg.id })
      .eq("organization_id", oldOrg.id);
    if (pErr) console.error("Erro ao migrar produtos:", pErr);
    else console.log("Produtos migrados com sucesso.");
  }

  // Migrar Vendedores (perfis)
  if (sellers && sellers.length > 0) {
    const { error: sErr } = await supabase
      .from("profiles")
      .update({ organization_id: newOrg.id })
      .eq("organization_id", oldOrg.id);
    if (sErr) console.error("Erro ao migrar vendedores:", sErr);
    else console.log("Vendedores migrados com sucesso.");
  }

  // Migrar Catálogo
  if (catalogs && catalogs.length > 0) {
    const { error: cErr } = await supabase
      .from("organization_catalogs")
      .update({ organization_id: newOrg.id })
      .eq("organization_id", oldOrg.id);
    if (cErr) console.error("Erro ao migrar catálogo:", cErr);
    else console.log("Catálogo migrado com sucesso.");
  }

  console.log("\nMigração concluída. Por favor, recarregue o dashboard.");
}

recoverData();
