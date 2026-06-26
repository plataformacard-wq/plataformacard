import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'b2b_admin' })
    .eq('id', 'edbf255c-403b-4c03-92dc-0cde45d52739');
    
  if (error) console.error(error);
  else console.log("Updated MAJ role to b2b_admin");
}

check();
