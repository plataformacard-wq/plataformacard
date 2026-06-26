import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, organization_id')
    .eq('organization_id', '3a7b0896-c7b0-45c7-824e-d35c4050ccdc');
    
  if (error) console.error(error);
  else console.log("MAJ PROFILES:", data);
}

check();
