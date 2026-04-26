
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  console.log('--- Iniciando Limpeza de Usuários Fake ---');

  // 1. Buscar organizações que não sejam a Maj nem o Super Admin
  const { data: orgs, error: fetchError } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .neq('name', 'Start - Super Admin')
    .not('name', 'ilike', '%MAJ%');

  if (fetchError) {
    console.error('Erro ao buscar organizações:', fetchError);
    return;
  }

  if (!orgs || orgs.length === 0) {
    console.log('Nenhuma organização fake encontrada.');
    return;
  }

  console.log(`Encontradas ${orgs.length} organizações para remover.`);
  
  for (const org of orgs) {
    console.log(`Removendo: ${org.name} (${org.slug})`);
    
    // Devido ao Cascade, deletar a org deve limpar perfis e produtos vinculados
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
