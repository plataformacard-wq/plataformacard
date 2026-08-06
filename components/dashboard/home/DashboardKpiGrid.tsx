import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { AreaSparkline, BarSparkline, DonutSparkline, SparklinePoint, DonutSegment } from "./DashboardKpiSparklines";

export interface StatItem {
  label: string;
  value: string | number;
  icon: any;
  trend: string;
  color: string;
  bgClass: string;
  textClass: string;
  sparklineType?: "area-blue" | "bar" | "donut" | "area-emerald";
  historyData?: SparklinePoint[];
  donutSegments?: DonutSegment[];
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
          className="group relative rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 md:p-6 transition-all hover:border-primary/50 hover:shadow-lg"
        >
          {/* Camada isolada de fundo para o efeito Glow (com overflow-hidden) */}
          <div className="absolute inset-0 rounded-[27px] overflow-hidden pointer-events-none">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
          </div>
          <div className="flex items-center justify-between">
            <div className={`rounded-xl p-2.5 ${stat.bgClass} ${stat.textClass}`}>
              <stat.icon size={22} />
            </div>

            {/* Sparkline Graphic / Chart on Right Side */}
            <div className="flex items-center justify-end">
              {stat.sparklineType === "area-blue" && (
                <AreaSparkline data={stat.historyData || []} color="blue" width={110} height={44} />
              )}
              {stat.sparklineType === "bar" && (
                <BarSparkline data={stat.historyData || []} color="#10b981" width={105} height={44} />
              )}
              {stat.sparklineType === "donut" && (
                <DonutSparkline segments={stat.donutSegments || []} size={50} strokeWidth={9} />
              )}
              {stat.sparklineType === "area-emerald" && (
                <AreaSparkline data={stat.historyData || []} color="emerald" width={110} height={44} />
              )}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--dash-text-secondary)] tracking-wide">{stat.label}</p>
              <h3 className="text-2xl font-extrabold text-[var(--dash-text-primary)] mt-1 tracking-tight">
                {loading ? "..." : stat.value}
              </h3>
            </div>

            {stat.trend && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ArrowUpRight size={12} />
                {stat.trend}
              </div>
            )}
          </div>
          
        </motion.div>
      ))}
    </motion.div>
  );
}

