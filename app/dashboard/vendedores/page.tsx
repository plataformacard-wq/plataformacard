import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendedoresClient from "./VendedoresClient";

export const dynamic = "force-dynamic";

export default async function VendedoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "b2b_admin" && profile?.role !== "superadmin") {
    redirect("/dashboard");
  }

  if (!profile?.organization_id) {
    return <div className="p-6">Organização não encontrada.</div>;
  }

  // Busca os vendedores da mesma organização
  const { data: sellers } = await supabase
    .from("profiles")
    .select("id, full_name, slug, avatar_url, created_at, user_id, can_customize_hours")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <VendedoresClient sellers={sellers || []} />
    </div>
  );
}
