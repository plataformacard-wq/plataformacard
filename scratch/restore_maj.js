
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function getEnv() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
  });
  return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function restoreMaj() {
  console.log('--- Restaurando Organização MAJ ---');
  
  const { data, error } = await supabase
    .from('organizations')
    .insert([
      { 
        name: 'MAJ MOBILIDADE ELÉTRICA', 
        slug: 'maj-mob-gestor', 
        business_model: 'B2B'
      }
    ])
    .select();

  if (error) {
    console.error('Erro ao restaurar Maj:', error);
    return;
  }
  
  const orgId = data[0].id;
  console.log('Maj restaurada com sucesso. ID:', orgId);

  // 2. Vincular o perfil 'Start' novamente se ele existir
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', '%Start%')
    .single();

  if (profile) {
    await supabase
      .from('profiles')
      .update({ organization_id: orgId, role: 'b2b_admin' })
      .eq('id', profile.id);
    console.log('Perfil Start vinculado novamente à Maj.');
  }
}

restoreMaj();
