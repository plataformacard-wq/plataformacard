import { createClient } from "@/lib/supabase/server";
import { activateCatalog, deactivateCatalog, createCatalog } from "./actions";
import { LayoutDashboard, Plus, AlertCircle } from "lucide-react";

export default async function Page() {
  const supabase = await createClient();

  // Catálogos platform
  const { data: catalogs } = await supabase
    .from("catalogs")
    .select("id, name")
    .eq("catalog_type", "platform");

  // Organizações
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name");

  // Relações ativas
  const { data: activeLinks } = await supabase
    .from("organization_catalogs")
    .select("organization_id, catalog_id");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            Ativar Catálogos
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Vincule catálogos da plataforma às organizações cadastradas.
          </p>
        </div>
      </div>

      {/* Seção: Criar Novo Catálogo */}
      <div className="border p-6 rounded-3xl shadow-sm bg-[var(--dash-surface)]" style={{ borderColor: "var(--dash-border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Plus size={20} className="text-primary" />
          <h2 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Criar Novo Catálogo da Plataforma</h2>
        </div>
        <form action={createCatalog} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>Nome do Catálogo</label>
              <input 
                name="name"
                required
                placeholder="Ex: Catálogo Padrão V1"
                className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>Descrição (Opcional)</label>
              <input 
                name="description"
                placeholder="Breve descrição do catálogo"
                className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>
          </div>
          <button 
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-xl font-bold text-sm hover:opacity-80 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Criar Catálogo
          </button>
        </form>
      </div>

      <div className="h-px bg-[var(--dash-border)]" />

      {(!catalogs || catalogs.length === 0) ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl text-center" style={{ borderColor: "var(--dash-border)" }}>
          <AlertCircle size={40} className="text-amber-500 mb-4" />
          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--dash-text-primary)" }}>Nenhum Catálogo Criado</h3>
          <p className="max-w-xs text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Você ainda não criou nenhum catálogo da plataforma. Use o formulário acima para criar o primeiro.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {catalogs?.map((catalog) => (
        <div key={catalog.id} className="border p-6 rounded-3xl shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <p className="font-bold text-lg mb-6" style={{ color: "var(--dash-text-primary)" }}>{catalog.name}</p>

          <div className="space-y-4">
            {organizations?.map((org) => {
              const isActive = activeLinks?.some(
                (link) =>
                  link.organization_id === org.id &&
                  link.catalog_id === catalog.id
              );

              return (
                <div key={org.id} className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)" }}>
                  <span className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>{org.name}</span>
                  
                  {isActive ? (
                    // 🔴 DESATIVAR
                    <form
                      action={deactivateCatalog}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="hidden"
                        name="organizationId"
                        value={org.id}
                      />
                      <input
                        type="hidden"
                        name="catalogId"
                        value={catalog.id}
                      />

                      <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        ATIVO
                      </span>

                      <button className="text-xs px-3 py-1.5 border rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-medium" style={{ color: "var(--dash-text-secondary)", borderColor: "var(--dash-border)" }}>
                        Desativar
                      </button>
                    </form>
                  ) : (
                    // 🟢 ATIVAR
                    <form action={activateCatalog}>
                      <input
                        type="hidden"
                        name="organizationId"
                        value={org.id}
                      />
                      <input
                        type="hidden"
                        name="catalogId"
                        value={catalog.id}
                      />

                      <button className="text-xs px-4 py-2 bg-black text-white rounded-xl hover:opacity-80 transition-all font-bold">
                        Ativar Catálogo
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
        </div>
      )}
    </div>
  );
}