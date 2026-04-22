import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Note: this might not have enough permissions to see everything, but let's try.
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(email: string) {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id, 
      full_name, 
      role, 
      organization_id,
      organizations (
        id,
        business_model
      )
    `)
    .ilike("full_name", `%${email}%`);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Profiles found:", JSON.stringify(profiles, null, 2));
}

checkUser("MAJ");
