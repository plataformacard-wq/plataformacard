import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: catalogs } = await supabase.from('catalogs').select('id, name, owner_id, organization_id, catalog_type').ilike('name', '%MAJ%');
  console.log("Catalogs matching 'MAJ':", catalogs);

  const { data: orgs } = await supabase.from('organizations').select('id, name, business_model, slug').ilike('name', '%mobilidade%');
  console.log("Orgs matching 'mobilidade':", orgs);
}

main();
