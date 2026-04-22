
import { createClient } from "./lib/supabase/server";

async function checkSchema() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('organizations').select('*').limit(1);
  console.log('Organizations sample:', data);
  if (data && data[0]) {
    console.log('Columns:', Object.keys(data[0]));
  }
}

checkSchema();
