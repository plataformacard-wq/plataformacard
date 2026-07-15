import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface SellerItem {
  id: string;
  full_name: string;
  slug: string;
  avatar_url: string;
}

export default function DashboardTeamList({ 
  sellers, 
  sellerCount 
}: { 
  sellers: SellerItem[]; 
  sellerCount: number | null;
}) {
  if (sellerCount === null) return null;

  return (
    <div className="rounded-3xl border bg-[var(--dash-surface)] p-6 shadow-sm border-[var(--dash-border)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--dash-text-primary)]">Equipe & Mini-sites</h3>
        <Link href="/dashboard/vendedores" className="text-[10px] font-bold text-primary hover:underline">GERENCIAR</Link>
      </div>
      <div className="space-y-3">
        {sellers.length > 0 ? (
          sellers.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--dash-hover-bg)] transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden border border-primary/20">
                  {s.avatar_url ? <img src={s.avatar_url} className="h-full w-full object-cover" /> : s.full_name?.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--dash-text-primary)] truncate max-w-[100px]">{s.full_name}</span>
                  <span className="text-[10px] text-[var(--dash-text-muted)] truncate max-w-[100px]">/{s.slug}</span>
                </div>
              </div>
              <Link 
                href={`/${s.slug}`} 
                target="_blank"
                className="p-1.5 rounded-lg bg-[var(--dash-bg)] text-[var(--dash-text-muted)] hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-[var(--dash-text-muted)] py-4 text-center">Nenhum vendedor cadastrado.</p>
        )}
        {sellerCount > 5 && (
          <p className="text-[10px] text-center text-[var(--dash-text-muted)] pt-2 border-t border-[var(--dash-border)]">
            e mais {sellerCount - 5} vendedores...
          </p>
        )}
      </div>
    </div>
  );
}
