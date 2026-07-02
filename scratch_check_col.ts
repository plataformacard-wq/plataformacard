import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data: cols } = await supabase.rpc('get_enum_values', { enum_name: 'catalog_type' });
  console.log("Enum values via RPC (if exists):", cols);
}

main();
