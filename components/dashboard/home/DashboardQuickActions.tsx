import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ActionItem {
  title: string;
  desc: string;
  icon: string | any;
  href: string;
  color: string;
}

export default function DashboardQuickActions({ quickActions }: { quickActions: ActionItem[] }) {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Ações Rápidas</h2>
        <button className="text-sm font-medium text-primary hover:underline">Ver tudo</button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickActions.map((action, idx) => (
          <Link 
            key={idx}
            href={action.href}
            className={`group flex items-start gap-4 rounded-[27px] border bg-gradient-to-br ${action.color} p-5 transition-all hover:scale-[1.02] hover:shadow-md`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-surface)] text-2xl shadow-sm border border-[var(--dash-border)]">
              {action.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[var(--dash-text-primary)] group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--dash-text-secondary)] line-clamp-2">
                {action.desc}
              </p>
            </div>
            <ChevronRight className="mt-1 text-[var(--dash-text-muted)] group-hover:translate-x-1 transition-transform" size={18} />
          </Link>
        ))}
      </div>
    </div>
  );
}
