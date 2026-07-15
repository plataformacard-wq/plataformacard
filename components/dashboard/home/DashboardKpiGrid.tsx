import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon: any;
  trend: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export default function DashboardKpiGrid({ stats, loading }: { stats: StatItem[], loading: boolean }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={item}
          className="group relative overflow-hidden rounded-2xl border bg-[var(--dash-surface)] p-6 transition-all hover:border-primary/50 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className={`rounded-xl p-2.5 ${stat.bgClass} ${stat.textClass}`}>
              <stat.icon size={22} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} />
              {stat.trend}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-[var(--dash-text-secondary)]">{stat.label}</p>
            <h3 className="text-2xl font-bold text-[var(--dash-text-primary)] mt-1">
              {loading ? "..." : stat.value}
            </h3>
          </div>
          
          {/* Subtle background glow on hover */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
        </motion.div>
      ))}
    </motion.div>
  );
}
