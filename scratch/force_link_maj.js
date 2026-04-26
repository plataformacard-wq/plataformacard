
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

async function forceLink() {
  const profileId = '74a79bc3-58fa-452a-b5cf-f568fb005bc1';
  const majOrgId = '490fd406-1bff-4a76-a9ae-18cb97ece3c0';

  console.log(`Vinculando perfil ${profileId} à organização ${majOrgId}...`);

  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      organization_id: majOrgId, 
      role: 'b2b_admin',
      full_name: 'Start - Gestor Maj' // Mudando o nome para facilitar a identificação
    })
    .eq('id', profileId)
    .select();

  if (error) {
    console.error('Erro no update:', error);
  } else {
    console.log('Update concluído com sucesso:', data);
  }

  // Verificar se existem outros perfis MAJ
  const { data: sellers } = await supabase
    .from('profiles')
    .select('full_name, organization_id')
    .eq('organization_id', majOrgId);
  
  console.log('Vendedores vinculados à MAJ agora:', sellers);
}

forceLink();
