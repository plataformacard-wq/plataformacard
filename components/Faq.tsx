"use client";

import { useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ChevronDown, ChevronUp } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const FAQ_ITEMS = [
  {
    question: "O que é o catálogo digital da PlataformaShop?",
    answer: "É uma versão interativa e sempre atualizada do seu catálogo de produtos em PDF. Em vez de enviar arquivos pesados pelo WhatsApp, você envia um link rápido onde o cliente pode ver fotos, preços em tempo real e até montar um pedido que cai direto no WhatsApp do vendedor."
  },
  {
    question: "Preciso pagar taxas sobre as vendas?",
    answer: "Não! A PlataformaShop não é um marketplace nem um gateway de pagamento que cobra comissões. Nós fornecemos a tecnologia de vitrine digital. As negociações e pagamentos continuam acontecendo diretamente entre você e seu cliente no WhatsApp, com 0% de taxa."
  },
  {
    question: "Meus clientes precisam baixar algum aplicativo?",
    answer: "De forma alguma. O catálogo funciona diretamente no navegador de qualquer smartphone, tablet ou computador. O cliente clica no link e a vitrine abre instantaneamente, sem atritos ou barreiras."
  },
  {
    question: "Posso usar a PlataformaShop para minha equipe de representantes?",
    answer: "Com certeza. No plano Enterprise, oferecemos a gestão de 'Master Catalog'. Você atualiza um preço ou produto no painel central e isso reflete instantaneamente nos links individuais de todos os seus vendedores ou franqueados."
  },
  {
    question: "Como funciona a integração com NFC?",
    answer: "Ao adquirir nossos cartões ou tags NFC físicos, basta encostá-los no celular de um cliente em uma reunião presencial. O celular abrirá automaticamente a sua vitrine digital da PlataformaShop na tela dele, causando um impacto altamente profissional."
  }
];

export function Faq({ faqs }: { faqs?: any[] }) {
  const finalFaqs = faqs && faqs.length > 0 ? faqs : FAQ_ITEMS;
  const [openIndex, setOpenIndex] = useState<number | null>(0); // O primeiro item começa aberto

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="text-[#2CCB68] text-sm font-bold uppercase tracking-widest mb-4">
            FAQ
          </div>
          <h2 className={`text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 ${plusJakarta.className}`}>
            Perguntas Frequentes
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Encontre respostas para as dúvidas comuns sobre vitrines digitais, NFC e o funcionamento da PlataformaShop.
          </p>
        </div>

        {/* Lista de Perguntas */}
        <div className="flex flex-col gap-4">
          {finalFaqs.map((item, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index} 
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen 
                    ? "bg-[#2CCB68]/5 border-[#2CCB68]/30 shadow-lg shadow-[#2CCB68]/5" 
                    : "bg-white/5 border-white/5 hover:border-white/10"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`text-lg font-bold transition-colors ${isOpen ? "text-[#2CCB68]" : "text-white"}`}>
                    {item.question}
                  </span>
                  <div 
                    className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isOpen ? "bg-[#2CCB68] text-black" : "bg-white/10 text-zinc-400"
                    }`}
                  >
                    {isOpen ? <ChevronUp size={20} strokeWidth={3} /> : <ChevronDown size={20} strokeWidth={2.5} />}
                  </div>
                </button>
                
                {/* 
                  Usando grid transition para animação de altura suave com CSS nativo 
                */}
                <div 
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-zinc-400 leading-relaxed border-t border-white/5 mt-2">
                      <div className="pt-4">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
