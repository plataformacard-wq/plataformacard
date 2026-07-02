import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FranquiasManagerClient from "./FranquiasManagerClient";

export const metadata = {
  title: "Gestão de Franquias - Dashboard",
  description: "Gerencie seus franqueados e catálogos matriz.",
};

export default async function FranquiasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, organizations(name, slug, business_model)")
    .eq("user_id", user.id)
    .single();

  const org = Array.isArray(profile?.organizations) ? profile?.organizations[0] : profile?.organizations;

  if (org?.business_model !== "ALL_SERVICE") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 space-y-8 pb-12">
      <section className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--dash-text-primary)" }}>
            Gestão de Franquias
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Crie catálogos matriz, convide franqueados e expanda a operação de {org?.name}.
          </p>
        </div>
      </section>

      <FranquiasManagerClient organizationId={profile?.organization_id || ""} orgSlug={org?.slug} />
    </div>
  );
}
