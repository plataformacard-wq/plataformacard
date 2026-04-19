import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  // Sellers não podem acessar a página da Empresa.
  if (profile?.role === "seller") {
    redirect("/dashboard/perfil");
  }

  return <>{children}</>;
}
