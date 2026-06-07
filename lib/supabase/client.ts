import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseClient: SupabaseClient | undefined;
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!globalForSupabase.supabaseClient) {
    globalForSupabase.supabaseClient = createBrowserClient(url, anonKey);
  }

  return globalForSupabase.supabaseClient;
}