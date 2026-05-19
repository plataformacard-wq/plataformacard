"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function PublicRecessTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  } | null>(null);

  useEffect(() => {
    function calculateTime() {
      const remainingMs = new Date(endsAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const totalSeconds = Math.floor(remainingMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000); // update every second

    return () => clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft || timeLeft.isOver) return null;

  return (
    <div className="mb-6 p-4 rounded-2xl bg-purple-500/10 dark:bg-purple-950/20 border border-purple-500/20 text-center animate-fade-in">
      <div className="flex items-center justify-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-xs mb-2">
        <Clock size={14} className="animate-spin-slow" />
        <span>RECESSO TEMPORÁRIO EM ANDAMENTO</span>
      </div>
      
      <div className="flex justify-center gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-purple-500/20 rounded-xl shadow-sm min-w-[50px]">
            <span className="text-sm font-black text-[var(--public-text-main)]">{timeLeft.days}</span>
            <span className="text-[8px] font-bold text-[var(--public-text-muted)] uppercase">Dias</span>
          </div>
        )}
        <div className="flex flex-col items-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-purple-500/20 rounded-xl shadow-sm min-w-[50px]">
          <span className="text-sm font-black text-[var(--public-text-main)]">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[8px] font-bold text-[var(--public-text-muted)] uppercase">Horas</span>
        </div>
        <div className="flex flex-col items-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-purple-500/20 rounded-xl shadow-sm min-w-[50px]">
          <span className="text-sm font-black text-[var(--public-text-main)]">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[8px] font-bold text-[var(--public-text-muted)] uppercase">Minutos</span>
        </div>
        <div className="flex flex-col items-center px-3 py-1.5 bg-white dark:bg-zinc-900 border border-purple-500/20 rounded-xl shadow-sm min-w-[50px]">
          <span className="text-sm font-black text-[var(--public-text-main)] text-purple-600 dark:text-purple-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[8px] font-bold text-[var(--public-text-muted)] uppercase">Segs</span>
        </div>
      </div>
      
      <p className="text-[10px] text-[var(--public-text-dim)] mt-3 leading-relaxed">
        O atendimento direto retornará automaticamente assim que a contagem terminar.
      </p>
    </div>
  );
}
