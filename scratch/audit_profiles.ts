
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function audit() {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log("--- AUDITORIA DE PERFIS ---");
  const { data: allProfiles } = await admin
    .from("profiles")
    .select("full_name, organization_id, role, slug, user_id")
    .order("created_at", { ascending: false })
    .limit(20);

  console.table(allProfiles);

  const maj = allProfiles.find(p => p.full_name && p.full_name.includes("Maj"));
  console.log("\nSeu Perfil Identificado:", maj);

  if (maj) {
    const matching = allProfiles.filter(p => p.organization_id === maj.organization_id && p.id !== maj.id);
    console.log(`\nOutros perfis na sua Org (${maj.organization_id}):`, matching.length);
  }
}

audit();
