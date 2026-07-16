import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BulkGridEditorWrapper from "./BulkGridEditorWrapper";

export const dynamic = "force-dynamic";

export default async function BulkPage() {
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
    const canBulk = catalogPerms.bulk !== false;
    if (!canBulk) {
      redirect("/dashboard/catalogo");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--dash-text-primary)]">
          Gerenciar produtos em Massa
        </h1>
        <p className="text-[var(--dash-text-secondary)]">
          Edite múltiplos produtos e categorias simultaneamente com interface de planilha.
        </p>
      </div>
      
      <BulkGridEditorWrapper />
    </div>
  );
}
