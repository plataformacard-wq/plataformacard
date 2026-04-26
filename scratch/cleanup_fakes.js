
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Função simples para ler .env.local
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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  console.log('--- Iniciando Limpeza de Usuários Fake ---');

  // 1. Buscar organizações que não sejam a Maj nem o Super Admin
  const { data: orgs, error: fetchError } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .neq('name', 'Start - Super Admin');

  if (fetchError) {
    console.error('Erro ao buscar organizações:', fetchError);
    return;
  }

  // Filtrar apenas as que parecem fakes (nome 'Usuário' ou UUID no nome/slug)
  const fakes = orgs.filter(org => 
    org.name === 'Usuário' || 
    org.name === 'Sem Nome' || 
    org.slug.length > 30 || // Slugs gerados como UUID
    org.name.includes('C915E7FA') || // Padrão que vi no print
    !['MAJ MOBILIDADE EL...'].includes(org.name)
  );

  if (!fakes || fakes.length === 0) {
    console.log('Nenhuma organização fake encontrada.');
    return;
  }

  console.log(`Encontradas ${fakes.length} organizações para remover.`);
  
  for (const org of fakes) {
    console.log(`Removendo: ${org.name} (${org.slug})`);
    
    // Deletar a org
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', org.id);

    if (deleteError) {
      console.error(`Erro ao deletar ${org.name}:`, deleteError);
    } else {
      console.log(`Sucesso: ${org.name} removida.`);
    }
  }

  console.log('--- Limpeza Concluída ---');
}

cleanup();
