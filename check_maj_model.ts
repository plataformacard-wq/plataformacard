import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, business_model, slug')
    .ilike('name', '%MAJ%');
    
  if (error) console.error(error);
  else console.log("MAJ ORGS:", data);
}

check();
