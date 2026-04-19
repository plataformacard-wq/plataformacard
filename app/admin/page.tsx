import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Total Organizations
  const { count: orgCount } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true });

  // 2. Total B2C Users
  const { count: b2cCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "b2c_admin");

  // 3. Total B2B Owners
  const { count: b2bCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "b2b_admin");

  // 4. Total Sellers
  const { count: sellerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "seller");

  // List recent signups
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, slug, role, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">QG de Comando</h1>
        <p className="mt-2 text-zinc-400">
          Bem-vindo ao centro nervoso do seu SaaS. Aqui você tem a visão global da operação.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <p className="text-sm font-medium text-zinc-400">Total de Empresas (Lojas)</p>
          <p className="mt-2 text-4xl font-bold text-white">{orgCount || 0}</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <p className="text-sm font-medium text-zinc-400">Assinantes B2B (Donos)</p>
          <p className="mt-2 text-4xl font-bold text-blue-400">{b2bCount || 0}</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <p className="text-sm font-medium text-zinc-400">Assinantes B2C (Autônomos)</p>
          <p className="mt-2 text-4xl font-bold text-emerald-400">{b2cCount || 0}</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
          <p className="text-sm font-medium text-zinc-400">Funcionários (Sellers)</p>
          <p className="mt-2 text-4xl font-bold text-purple-400">{sellerCount || 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/50">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Usuários Recentes na Plataforma</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="border-b border-white/10 bg-black/20 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Plano / Cargo</th>
                <th className="px-6 py-3 font-medium">Data de Criação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recentProfiles?.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{p.full_name || "Sem Nome"}</td>
                  <td className="px-6 py-4">
                    <a href={`/p/${p.slug}`} target="_blank" className="text-blue-400 hover:underline">
                      /p/{p.slug}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.role === 'superadmin' ? 'bg-red-500/10 text-red-400' :
                      p.role === 'b2b_admin' ? 'bg-blue-500/10 text-blue-400' :
                      p.role === 'b2c_admin' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!recentProfiles || recentProfiles.length === 0) && (
            <p className="p-6 text-center text-sm text-zinc-500">Nenhum usuário encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}