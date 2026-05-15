import { createClient } from "@/lib/supabase/server";
import { activateCatalog, deactivateCatalog } from "./actions";

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
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">
        Ativar Catálogos
      </h1>

      {catalogs?.map((catalog) => (
        <div key={catalog.id} className="border p-4 rounded-lg">
          <p className="font-semibold mb-4">{catalog.name}</p>

          <div className="space-y-3">
            {organizations?.map((org) => {
              const isActive = activeLinks?.some(
                (link) =>
                  link.organization_id === org.id &&
                  link.catalog_id === catalog.id
              );

              return (
                <div key={org.id}>
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

                      <span className="text-green-500 text-sm">
                        ✅ Ativo para {org.name}
                      </span>

                      <button className="text-xs px-2 py-1 border rounded hover:bg-white/10">
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

                      <button className="text-sm px-3 py-1 border rounded hover:bg-white/10">
                        Ativar para {org.name}
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
  );
}