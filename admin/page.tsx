import { createClient } from "@/lib/supabase/server";

type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export default async function Page() {
  const supabase = await createClient();

  // =========================
  // ORGANIZAÇÕES
  // =========================
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, created_at");

  // =========================
  // USUÁRIOS
  // =========================
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // =========================
  // EVENTOS (analytics)
  // =========================
  const { count: visitsCount } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "visit");

  const { count: conversationsCount } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "whatsapp_click");

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">
        Painel Admin
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white/5 border">
          <p className="text-sm text-gray-400">Organizações</p>
          <p className="text-xl font-bold">
            {organizations?.length || 0}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border">
          <p className="text-sm text-gray-400">Usuários</p>
          <p className="text-xl font-bold">
            {usersCount || 0}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border">
          <p className="text-sm text-gray-400">Visitas</p>
          <p className="text-xl font-bold">
            {visitsCount || 0}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border">
          <p className="text-sm text-gray-400">Conversas</p>
          <p className="text-xl font-bold">
            {conversationsCount || 0}
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Organizações
        </h2>

        <div className="space-y-4">
          {organizations?.map((org) => (
            <div
              key={org.id}
              className="border rounded-lg p-4 bg-white/5"
            >
              <p className="font-semibold">{org.name}</p>

              <p className="text-sm text-gray-400">
                ID: {org.id}
              </p>

              <p className="text-sm text-gray-400">
                Criado em:{" "}
                {new Date(org.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}