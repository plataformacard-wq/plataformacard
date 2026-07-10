import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function fixPlatformCatalog() {
  const orgId = '3a7b0896-c7b0-45c7-824e-d35c4050ccdc';
  
  const { data, error } = await supabase.from('catalogs').update({
    out_of_stock_at_end: true
  }).eq('organization_id', orgId).eq('catalog_type', 'platform').select();
  
  console.log('Fixed platform catalog:', data, error);
}

fixPlatformCatalog();
