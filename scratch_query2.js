const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('catalogs').select('*').limit(1);
  if (error) {
    console.error("ERROR SELECTING FROM CATALOGS:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("CATALOG KEYS:", Object.keys(data[0]));
    console.log("CATALOG DATA:", data[0]);
  } else {
    console.log("No catalogs found, checking schema via metadata/RPC if available...");
  }
}

run();
