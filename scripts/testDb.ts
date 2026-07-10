import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  console.log("Checking catalogs for MAJ...");
  const { data: orgs } = await supabase.from('organizations').select('id, name, slug').ilike('slug', 'majmobilidade');
  console.log('Orgs:', orgs);
  
  if (orgs && orgs.length > 0) {
    const orgId = orgs[0].id;
    const { data: cats } = await supabase.from('catalogs').select('id, name, out_of_stock_at_end, catalog_type').eq('organization_id', orgId);
    console.log('MAJ Catalogs:', cats);
  }

  console.log("Checking target catalog for /teste...");
  const { data: profiles } = await supabase.from('profiles').select('id, organization_id').eq('slug', 'teste');
  console.log('Profile /teste:', profiles);
  
  if (profiles && profiles.length > 0) {
    const orgId = profiles[0].organization_id;
    const { data: testCats } = await supabase.from('catalogs').select('id, name, out_of_stock_at_end, catalog_type').eq('organization_id', orgId);
    console.log('Teste Catalogs:', testCats);
  }
  
  console.log("Checking M2 product stock...");
  const { data: prods } = await supabase.from('products').select('id, name, is_in_stock').ilike('name', '%M2%');
  console.log('M2 Products:', prods);
}

test();
