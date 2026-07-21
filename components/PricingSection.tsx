"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, LucideIcon } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

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

export function PricingSection({ plans }: { plans: any[] }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="planos" className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-extrabold text-white mb-4 ${plusJakarta.className}`}>
            Planos desenhados para o seu tamanho
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
            Você não precisa ser uma corporação gigante para usar tecnologia inteligente.
          </p>

          {/* Toggle Switch */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="inline-flex items-center bg-[#1c1c1e] border border-white/10 rounded-full p-1 relative">
              <div 
                className={`absolute top-1 bottom-1 w-1/2 bg-[#2CCB68] rounded-full transition-transform duration-300 ease-in-out ${isAnnual ? 'translate-x-[96%]' : 'translate-x-1'}`}
              ></div>
              <button
                onClick={() => setIsAnnual(false)}
                className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${!isAnnual ? 'text-[#0A0A0A]' : 'text-zinc-400 hover:text-white'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${isAnnual ? 'text-[#0A0A0A]' : 'text-zinc-400 hover:text-white'}`}
              >
                Anual
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {(plans || []).map((plan: any) => {
            // Extrai valor numérico de strings formatadas (ex: "R$ 89,90" -> 89.90)
            const parsePrice = (str: string | undefined | null) => {
              if (!str) return 0;
              const numericStr = str.replace(/[^0-9,]/g, '').replace(',', '.');
              return parseFloat(numericStr) || 0;
            };

            const basePrice = parsePrice(plan.price_monthly || plan.price_text);
            
            // Calcula o Preço Anual dinamicamente com base nas regras do CMS sobre o Preço Base (Mensal)
            let calculatedAnnualPriceValue = 0;
            const discountType = plan.annual_discount_type || 'fixed';
            const discountValue = Number(plan.annual_discount_value) || 0;

            if (discountType === 'percentage') {
              calculatedAnnualPriceValue = basePrice * (1 - (discountValue / 100));
            } else {
              calculatedAnnualPriceValue = basePrice - discountValue;
            }
            if (calculatedAnnualPriceValue <= 0 && basePrice > 0) {
              calculatedAnnualPriceValue = basePrice; // fallback
            }

            // Decide qual preço está ativo (Gigante)
            const currentActivePriceValue = isAnnual ? calculatedAnnualPriceValue : basePrice;
            const displayPriceStr = currentActivePriceValue > 0 ? `R$ ${currentActivePriceValue.toFixed(2).replace('.', ',')}/mês` : plan.price_text;
            
            // Preço Riscado: Apenas no modo Anual, e o valor é o Preço Base
            const displayOriginal = (isAnnual && basePrice > calculatedAnnualPriceValue) ? `R$ ${basePrice.toFixed(2).replace('.', ',')}` : null; 

            // Calcula o valor exato do desconto para o Sticker (Apenas no Anual)
            const activeDiscountValue = basePrice - currentActivePriceValue;
            const formattedDiscountSticker = (isAnnual && activeDiscountValue > 0) ? `R$ ${activeDiscountValue.toFixed(2).replace('.', ',')} OFF/mês` : null;

            // Formata: "R$ 39,90/mês" -> currency: "R$", value: "39,90", suffix: "/mês"
            const priceMatch = typeof displayPriceStr === 'string' ? displayPriceStr.match(/(R\$)\s*([\d,]+)(.*)/) : null;

            return (
              <div 
                key={plan.id} 
                className={`relative flex flex-col h-full ${plan.theme === 'green' ? 'bg-[#2CCB68]/5 border border-[#2CCB68] rounded-3xl p-10 backdrop-blur-md mt-6 lg:mt-0' : 'bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md mt-6 lg:mt-0'}`}
              >
                {/* Badge Recomendado (Centro) */}
                {plan.badge_text && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full uppercase text-xs font-bold ${plan.theme === 'green' ? 'bg-[#2CCB68] text-[#0A0A0A]' : 'bg-white text-black'}`}>
                    {plan.badge_text}
                  </div>
                )}
                
                <div className="flex flex-col items-start gap-2 mb-4">
                  <div className={`text-xl font-bold ${plan.theme === 'green' ? 'text-[#2CCB68]' : 'text-zinc-300'}`}>{plan.name}</div>
                  
                  {/* Badge Desconto (Abaixo do Nome) */}
                  {formattedDiscountSticker && (
                    <div className="px-2.5 py-1 rounded-md text-[11px] uppercase font-bold bg-[#FFB800] text-black shadow-sm">
                      {formattedDiscountSticker}
                    </div>
                  )}
                </div>
                
                <div className="min-h-[96px] mb-2 flex flex-col justify-end">
                  {displayOriginal && (
                    <div className="text-zinc-500 line-through text-lg mb-1 font-bold">
                      {displayOriginal}
                    </div>
                  )}
                  
                  {priceMatch ? (
                    <div className={`flex items-baseline gap-1 text-white ${plusJakarta.className}`}>
                      <span className="text-2xl font-bold text-white/80">{priceMatch[1]}</span>
                      <span className="text-5xl font-extrabold">{priceMatch[2]}</span>
                      <span className="text-lg font-medium text-zinc-400">{priceMatch[3]}</span>
                    </div>
                  ) : (
                    <div className={`text-5xl font-extrabold text-white ${plusJakarta.className}`}>
                      {displayPriceStr}
                    </div>
                  )}

                  {!isAnnual && currentActivePriceValue > 0 && (
                     <div className="text-[13px] text-zinc-400 mt-2 font-medium tracking-wide">
                       Total de <strong className="text-zinc-200">R$ {(currentActivePriceValue * 12).toFixed(2).replace('.', ',')}</strong> por ano.
                     </div>
                  )}
                  {isAnnual && activeDiscountValue > 0 && (
                     <div className="text-[12px] font-bold text-[#2CCB68] mt-2 inline-flex items-center bg-[#2CCB68]/10 px-2.5 py-1 rounded-md w-fit uppercase tracking-wider">
                       economize R$ {(activeDiscountValue * 12).toFixed(2).replace('.', ',')} por ano.
                     </div>
                  )}

                </div>
                
                <p className="text-zinc-400 mb-8 h-10">{plan.subtitle}</p>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                      <div className="text-[#2CCB68]"><CheckIcon size={18} /></div>
                      {feat}
                    </li>
                  ))}
                </ul>
                
                {plan.button_url.startsWith("http") ? (
                  <a href={plan.button_url} target="_blank" rel="noopener noreferrer" className={`mt-auto flex flex-col items-center justify-center gap-1 w-full py-4 rounded-xl font-bold transition-colors ${plan.theme === 'green' ? 'bg-[#2CCB68] text-[#0A0A0A] hover:bg-[#23994A] hover:text-white' : 'border border-[#2CCB68] text-[#2CCB68] hover:bg-[#2CCB68]/10'}`}>
                    <div className="flex items-center gap-2">
                      {plan.button_url.includes("wa.me") && <WhatsAppIcon size={20} />}
                      {plan.button_text}
                    </div>
                    {plan.theme === 'green' && isAnnual && (
                      <span className="text-[10px] uppercase font-bold opacity-80 text-center px-2">Cartão NFC Grátis Incluso!</span>
                    )}
                  </a>
                ) : (
                  <Link href={plan.button_url} className={`mt-auto flex flex-col items-center justify-center gap-1 w-full py-4 rounded-xl font-bold transition-colors ${plan.theme === 'green' ? 'bg-[#2CCB68] text-[#0A0A0A] hover:bg-[#23994A] hover:text-white' : 'border border-[#2CCB68] text-[#2CCB68] hover:bg-[#2CCB68]/10'}`}>
                    <span>{plan.button_text}</span>
                    {plan.theme === 'green' && isAnnual && (
                      <span className="text-[10px] uppercase font-bold opacity-80 text-center px-2">Cartão NFC Grátis Incluso!</span>
                    )}
                  </Link>
                )}

                {isAnnual && calculatedAnnualPriceValue > 0 && basePrice > calculatedAnnualPriceValue && (
                  <div className="text-xs text-zinc-500 mt-5 text-center leading-relaxed">
                    12 meses por apenas <strong className="text-zinc-300">R$ {(calculatedAnnualPriceValue * 12).toFixed(2).replace('.', ',')}</strong> (preço normal R$ {(basePrice * 12).toFixed(2).replace('.', ',')}). Renovação por R$ {basePrice.toFixed(2).replace('.', ',')}/mês.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
