const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('redirect_leads').eq('slug', 'leonardo').maybeSingle();
  console.log("PROFILE redirect_leads:", data);
  console.log("ERROR:", error);
}

run();
