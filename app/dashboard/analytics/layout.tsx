import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, dash_access_analytics")
    .eq("user_id", user.id)
    .single();

  // Sellers só podem acessar se tiverem a permissão delegada.
  if (profile?.role === "seller" && !profile?.dash_access_analytics) {
    redirect("/dashboard/perfil");
  }

  return <>{children}</>;
}
