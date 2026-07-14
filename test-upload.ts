import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
  const fileContent = fs.readFileSync('package.json');
  const { data, error } = await supabase.storage.from('avatars').upload('test/package.json', fileContent, { upsert: true });
  console.log('Upload Admin:', data, error);
}
run();
