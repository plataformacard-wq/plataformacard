import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('catalog_id', 'e158a70e-7976-4958-bb00-b6f2b65269fe');
  console.log("Products in platform catalog:", count);
}

main();
