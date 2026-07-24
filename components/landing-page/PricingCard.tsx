"use client";

import React from "react";
import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PLANS, PlanSlug, PlanDefinition } from "@/lib/plans/feature-matrix";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.015-1.04 2.476 1.064 2.872 1.213 3.071c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.575-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.81 11.81 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export type PricingCardProps = {
  plan: any;
  isAnnual: boolean;
  isInteractive?: boolean;
  officialPlan?: PlanDefinition;
};

export function PricingCard({ plan, isAnnual, isInteractive = true, officialPlan: propOfficialPlan }: PricingCardProps) {
  // Mapeia o slug do plano para a definição oficial com preços Kiwify e Ancoragem
  const rawSlug = (plan?.slug || plan?.id || '').toLowerCase().trim();
  const rawName = (plan?.name || '').toLowerCase().trim();
  const slugNorm = rawSlug.replace(/[^a-z_]/g, '') as PlanSlug;
  const combined = `${rawSlug} ${rawName}`;

  const detectedOfficialPlan = PLANS[slugNorm] || (
    (combined.includes('franqueador') || combined.includes('all_service') || combined.includes('hibrida') || combined.includes('enterprise'))
      ? PLANS.all_service
      : (combined.includes('sales') || combined.includes('team') || combined.includes('premium') || combined.includes('corporativo'))
        ? PLANS.sales_team
        : combined.includes('pro')
          ? PLANS.pro
          : PLANS.starter
  );

  const officialPlan = propOfficialPlan || detectedOfficialPlan;

  // 🟢 PREÇOS REAIS DA KIWIFY (Imutáveis)
  const realMonthlyPrice = officialPlan.monthlyPrice; 
  const realAnnualPrice = officialPlan.annualPrice;   

  // 🎯 ANCORAGEM PERSONALIZADA INDEPENDENTE (Mensal vs Anual)
  const parsePriceNum = (str: any) => {
    if (str === null || str === undefined) return null;
    const trimmed = String(str).trim();
    if (trimmed === "" || trimmed === "0" || trimmed === "0,00" || trimmed === "0.00") return 0;
    const numericStr = trimmed.replace(/[^0-9,.]/g, '').replace(',', '.');
    const parsed = parseFloat(numericStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const monthlyAnchorRaw = parsePriceNum(plan?.price_monthly);
  const annualAnchorRaw = parsePriceNum(plan?.original_price);

  const monthlyAnchor = monthlyAnchorRaw !== null ? monthlyAnchorRaw : officialPlan.monthlyAnchor;
  const annualAnchor = annualAnchorRaw !== null ? annualAnchorRaw : (officialPlan.monthlyPrice || officialPlan.monthlyAnchor);

  // Decide qual preço cobrado e qual âncora estão ativos
  const currentActivePriceValue = isAnnual ? realAnnualPrice : realMonthlyPrice;
  const currentAnchorValue = isAnnual ? annualAnchor : monthlyAnchor;
  const displayPriceStr = `R$ ${currentActivePriceValue.toFixed(2).replace('.', ',')}/mês`;

  // Preço Riscado de Ancoragem (Apenas se a âncora for MAIOR que o valor real Kiwify E maior que 0)
  const hasValidAnchor = currentAnchorValue > currentActivePriceValue && currentAnchorValue > 0;
  const displayOriginal = hasValidAnchor ? `R$ ${currentAnchorValue.toFixed(2).replace('.', ',')}` : null; 

  // Desconto mensal acumulado comparado à âncora ativa
  const activeDiscountValue = hasValidAnchor ? currentAnchorValue - currentActivePriceValue : 0;
  const formattedDiscountSticker = activeDiscountValue > 0 ? `R$ ${activeDiscountValue.toFixed(2).replace('.', ',')} OFF/mês` : null;

  const priceMatch = displayPriceStr.match(/(R\$)\s*([\d,]+)(.*)/);

  const isGreenTheme = plan?.theme === 'green';
  const featuresList = Array.isArray(plan?.features) 
    ? plan.features.filter((f: any) => typeof f === 'string' && f.trim() !== '') 
    : [];

  const buttonText = plan?.button_text || (isGreenTheme ? "Assinar Agora" : "Criar Conta");
  const buttonUrl = plan?.button_url || `/checkout?plan=${officialPlan.slug}`;

  return (
    <div 
      className={`relative flex flex-col h-full w-full transition-all ${!isInteractive ? 'pointer-events-none select-none' : ''} ${
        isGreenTheme 
          ? 'bg-emerald-500/5 dark:bg-[#2CCB68]/5 border-2 border-[#2CCB68] rounded-3xl p-5 xl:p-6 sm:p-7 backdrop-blur-md shadow-lg dark:shadow-none' 
          : 'bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-5 xl:p-6 sm:p-7 backdrop-blur-md shadow-md dark:shadow-none'
      }`}
    >
      {/* Badge Recomendado (Centro) */}
      {plan?.badge_text && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full uppercase text-[11px] font-bold tracking-wider z-20 whitespace-nowrap shadow-md ${isGreenTheme ? 'bg-[#2CCB68] text-[#0A0A0A]' : 'bg-zinc-900 text-white dark:bg-white dark:text-black'}`}>
          {plan.badge_text}
        </div>
      )}
      
      <div className="flex flex-col items-start gap-1.5 mb-2 min-h-[56px]">
        <div className={`text-xl font-bold ${isGreenTheme ? 'text-[#2CCB68]' : 'text-zinc-800 dark:text-zinc-300'}`}>
          {plan?.name || officialPlan.name}
        </div>
        
        {/* Badge Desconto (Slot Fixo) */}
        <div className="h-6 flex items-center">
          {formattedDiscountSticker ? (
            <div className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FFB800] text-black shadow-sm whitespace-nowrap">
              {formattedDiscountSticker}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Container de Precificação Alinhado */}
      <div className="flex flex-col justify-end mb-3">
        {/* Slot de Preço Riscado (Altura Fixa de Alinhamento) */}
        <div className="h-6 flex items-center mb-0.5">
          {displayOriginal ? (
            <div className="text-zinc-400 dark:text-zinc-500 line-through text-xs sm:text-sm font-bold whitespace-nowrap">
              {displayOriginal}
            </div>
          ) : null}
        </div>
        
        {/* Preço Principal (Fonte Ajustada sem Quebra de UX) */}
        <div className="min-h-[44px] flex items-baseline">
          {priceMatch ? (
            <div className={`flex items-baseline gap-0.5 text-zinc-900 dark:text-white whitespace-nowrap ${plusJakarta.className}`}>
              <span className="text-base sm:text-lg font-bold text-zinc-600 dark:text-white/80 shrink-0">{priceMatch[1]}</span>
              <span className="text-3xl sm:text-[32px] xl:text-[38px] font-extrabold text-zinc-900 dark:text-white tracking-tight shrink-0">{priceMatch[2]}</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">{priceMatch[3]}</span>
            </div>
          ) : (
            <div className={`text-3xl sm:text-[32px] xl:text-[38px] font-extrabold text-zinc-900 dark:text-white whitespace-nowrap ${plusJakarta.className}`}>
              {displayPriceStr}
            </div>
          )}
        </div>

        {/* Slot Subtexto de Economia (Altura Fixa de Alinhamento) */}
        <div className="min-h-[30px] mt-1.5 flex items-center">
          {!isAnnual && currentActivePriceValue > 0 && (
             <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wide whitespace-nowrap">
               Total de <strong className="text-zinc-800 dark:text-zinc-200">R$ {(currentActivePriceValue * 12).toFixed(2).replace('.', ',')}</strong> por ano.
             </div>
          )}
          {isAnnual && activeDiscountValue > 0 && (
             <div className="text-[10px] font-bold text-[#2CCB68] bg-[#2CCB68]/10 px-2.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
               economize R$ {(activeDiscountValue * 12).toFixed(2).replace('.', ',')} por ano.
             </div>
          )}
        </div>
      </div>
      
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 min-h-[40px] leading-snug">{plan?.subtitle || "Sem descrição definida."}</p>
      
      <ul className="space-y-3 mb-8 flex-1">
        {featuresList.map((feat: string, i: number) => (
          <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            <div className="text-[#2CCB68] shrink-0"><CheckIcon size={16} /></div>
            <span className="line-clamp-2">{feat}</span>
          </li>
        ))}
        {featuresList.length === 0 && (
          <li className="text-xs text-zinc-400 dark:text-zinc-600 italic">Nenhuma funcionalidade adicionada.</li>
        )}
      </ul>
      
      {buttonUrl.startsWith("http") ? (
        <a 
          href={buttonUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`mt-auto flex flex-col items-center justify-center gap-1 w-full py-3.5 rounded-xl font-bold text-sm transition-colors ${isGreenTheme ? 'bg-[#2CCB68] text-[#0A0A0A] hover:bg-[#23994A] hover:text-white' : 'border border-[#2CCB68] text-[#2CCB68] hover:bg-[#2CCB68]/10'}`}
        >
          <div className="flex items-center gap-2">
            {buttonUrl.includes("wa.me") && <WhatsAppIcon size={18} />}
            {buttonText}
          </div>
          {isGreenTheme && isAnnual && (
            <span className="text-[9px] uppercase font-bold opacity-80 text-center px-2">Cartão NFC Grátis Incluso!</span>
          )}
        </a>
      ) : (
        <Link 
          href={`/checkout?plan=${officialPlan.slug}&cycle=${isAnnual ? 'annual' : 'monthly'}`} 
          className={`mt-auto flex flex-col items-center justify-center gap-1 w-full py-3.5 rounded-xl font-bold text-sm transition-colors ${isGreenTheme ? 'bg-[#2CCB68] text-[#0A0A0A] hover:bg-[#23994A] hover:text-white' : 'border border-[#2CCB68] text-[#2CCB68] hover:bg-[#2CCB68]/10'}`}
        >
          <span>{buttonText}</span>
          {isGreenTheme && isAnnual && (
            <span className="text-[9px] uppercase font-bold opacity-80 text-center px-2">Cartão NFC Grátis Incluso!</span>
          )}
        </Link>
      )}

      {isAnnual && realAnnualPrice > 0 && (
        <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-4 text-center leading-relaxed">
          12 meses por apenas <strong className="text-zinc-700 dark:text-zinc-300">R$ {(realAnnualPrice * 12).toFixed(2).replace('.', ',')}</strong> {hasValidAnchor && annualAnchor > realAnnualPrice && <>(preço de referência R$ {(annualAnchor * 12).toFixed(2).replace('.', ',')})</>}. Renovação anual garantida.
        </div>
      )}
    </div>
  );
}
