import { createClient } from "@/lib/supabase/server";
import CardList from "./CardList";
import { UserCircle, Eye, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CartoesPage() {
  const supabase = await createClient();

  // 1. Fetch profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      slug,
      avatar_url,
      role,
      organizations (
        name
      )
    `)
    .neq("role", "superadmin")
    .order("full_name");

  // 2. Fetch Global Analytics Events for aggregation
  // In a real production scenario, this should be done via an RPC with GROUP BY
  const { data: events } = await supabase
    .from("analytics_events")
    .select("profile_id, event_type");

  // 3. Aggregate stats in JS
  const statsMap: Record<string, { views: number; clicks: number }> = {};
  events?.forEach(ev => {
    if (!statsMap[ev.profile_id]) {
      statsMap[ev.profile_id] = { views: 0, clicks: 0 };
    }
    if (ev.event_type === 'view') statsMap[ev.profile_id].views++;
    if (ev.event_type === 'whatsapp_click' || ev.event_type === 'product_whatsapp_click') {
      statsMap[ev.profile_id].clicks++;
    }
  });

  const cardsWithStats = profiles?.map(p => ({
    ...p,
    viewCount: statsMap[p.id]?.views || 0,
    clickCount: statsMap[p.id]?.clicks || 0,
  })) || [];

  const globalViews = Object.values(statsMap).reduce((acc, s) => acc + s.views, 0);
  const globalClicks = Object.values(statsMap).reduce((acc, s) => acc + s.clicks, 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            Cartões Públicos
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Monitoramento de tráfego, performance de links e conversão em tempo real.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 rounded-3xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Eye size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider leading-none mb-1">Visitas Globais</p>
              <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>{globalViews}</p>
            </div>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 rounded-3xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider leading-none mb-1">Total de Leads</p>
              <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>{globalClicks}</p>
            </div>
          </div>
        </div>
      </div>

      <CardList cards={cardsWithStats} />
    </div>
  );
}
