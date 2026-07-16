import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CatalogoClientWrapper from "./CatalogoClientWrapper";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, granular_permissions")
    .eq("id", user.id)
    .single();

  if (profile?.role === "seller") {
    const catalogPerms = (profile.granular_permissions as any)?.catalog || {};
    const canManageProducts = catalogPerms.create !== false || catalogPerms.edit !== false || catalogPerms.delete !== false;
    if (!canManageProducts) {
      redirect("/dashboard/perfil");
    }
  }

  return <CatalogoClientWrapper />;
}