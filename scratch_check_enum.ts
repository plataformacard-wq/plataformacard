import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data } = await supabase.from('catalogs').select('catalog_type');
  const types = new Set(data?.map(d => d.catalog_type));
  console.log("Existing catalog types:", Array.from(types));
}

main();
