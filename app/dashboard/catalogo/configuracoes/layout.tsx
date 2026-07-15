import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ConfigLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, granular_permissions")
    .eq("user_id", user.id)
    .single();

  if (profile?.role === "seller") {
    const perms = profile.granular_permissions as any;
    const cat = perms?.catalog;
    if (!cat?.settings_general && !cat?.settings_behavior && !cat?.settings_banners && !cat?.settings_status) {
      redirect("/dashboard/catalogo");
    }
  }

  return <>{children}</>;
}
