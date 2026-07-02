import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const catalogId = 'e158a70e-7976-4958-bb00-b6f2b65269fe';
  const newOrgId = '3a7b0896-c7b0-45c7-824e-d35c4050ccdc';
  const newOwnerId = 'edbf255c-403b-4c03-92dc-0cde45d52739';

  console.log("1. Atualizando Catálogo...");
  const { error: catError } = await supabase
    .from('catalogs')
    .update({
      owner_id: newOwnerId,
      owner_profile_id: newOwnerId,
      organization_id: newOrgId,
      catalog_type: 'franchise'
    })
    .eq('id', catalogId);

  if (catError) {
    console.error("Erro no catálogo:", catError);
    return;
  }
  console.log("Catálogo atualizado.");

  console.log("2. Buscando categorias...");
  const { data: categories } = await supabase.from('categories').select('id').eq('catalog_id', catalogId);
  const catIds = categories?.map(c => c.id) || [];
  
  if (catIds.length > 0) {
    console.log(`3. Atualizando produtos nas ${catIds.length} categorias...`);
    const { data: updatedProducts, error: prodError } = await supabase
      .from('products')
      .update({ organization_id: newOrgId })
      .in('category_id', catIds)
      .select('id');

    if (prodError) {
      console.error("Erro nos produtos:", prodError);
      return;
    }
    console.log(`${updatedProducts?.length} produtos atualizados com sucesso.`);
  } else {
    console.log("Nenhuma categoria encontrada para atualizar os produtos.");
  }
}

main();
