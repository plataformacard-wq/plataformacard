const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data } = await supabase.from('organization_product_overrides').select('product_id, is_in_stock, sort_order');
  console.log(data.filter(o => o.sort_order !== null));
}
main();
