
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Carregar variáveis de ambiente manualmente se necessário
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function diagnostic() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente não encontradas.");
    return;
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey);
  
  // 1. Buscar vendedores recentes
  console.log("--- BUSCANDO VENDEDORES RECENTES ---");
  const { data: recentSellers, error: fetchError } = await admin
    .from("profiles")
    .select("full_name, organization_id, role, created_at, slug")
    .eq("role", "seller")
    .order("created_at", { ascending: false })
    .limit(10);

  if (fetchError) {
    console.error("Erro ao buscar vendedores:", fetchError);
    return;
  }

  console.log(`Total de vendedores encontrados: ${recentSellers.length}`);
  recentSellers.forEach(s => {
    console.log(`> [${s.created_at}] Nome: ${s.full_name} | Slug: ${s.slug} | Org: ${s.organization_id}`);
  });

  // 2. Buscar sua organização (Maj)
  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name")
    .ilike("name", "%Maj%");
  
  console.log("\n--- ORGANIZAÇÕES ENCONTRADAS (Maj) ---");
  console.log(orgs);
}

diagnostic();
