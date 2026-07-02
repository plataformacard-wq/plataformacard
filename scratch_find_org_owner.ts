import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, email, role, organization_id').eq('organization_id', '3a7b0896-c7b0-45c7-824e-d35c4050ccdc');
  console.log("Profiles in Target Org:", profiles);
}

main();
