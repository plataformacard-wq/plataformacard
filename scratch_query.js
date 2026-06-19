const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    const { data: profiles } = await supabase.from('profiles').select('id, user_id, full_name, role');
    console.log("PROFILES (id vs user_id):", profiles);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

run();
