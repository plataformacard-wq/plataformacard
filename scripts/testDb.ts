import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  console.log('Total Profiles:', count);
  
  const { data: profile } = await supabase.from('profiles').select('id, full_name, slug').ilike('slug', 'teste');
  console.log('Profile /teste:', profile);
  
  const { data: profile2 } = await supabase.from('profiles').select('id, full_name, slug').ilike('slug', '%teste%');
  console.log('Profile containing teste:', profile2);
}

test();
