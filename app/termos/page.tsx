import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso | PlataformaCard",
  description: "Termos e Condições de Uso da PlataformaCard",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white selection:bg-emerald-500/30">
      <div className="mx-auto w-full max-w-3xl">
        <Link 
          href="/cadastro" 
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para Cadastro
        </Link>
        
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 shadow-2xl backdrop-blur-sm">
          <h1 className="mb-8 text-3xl sm:text-4xl font-black tracking-tight">Termos de Uso</h1>
          
          <div className="prose prose-invert prose-emerald max-w-none space-y-6 text-zinc-300">
            <p className="text-sm font-medium text-zinc-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            
            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a PlataformaCard, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Descrição do Serviço</h2>
              <p>
                A PlataformaCard fornece uma infraestrutura digital no modelo Software as a Service (SaaS), permitindo a criação 
                de catálogos digitais, vitrines e gestão B2B/B2C/CaaS. O serviço é oferecido "no estado em que se encontra", 
                podendo passar por atualizações e manutenções periódicas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Cadastro e Segurança da Conta</h2>
              <p>
                Para utilizar nossos serviços, você deve fornecer informações precisas e completas. 
                Você é o único responsável por manter a confidencialidade das credenciais de sua conta e por todas as atividades 
                que ocorrerem sob a mesma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Regras de Conduta</h2>
              <p>Você concorda em NÃO utilizar a plataforma para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Violar quaisquer leis locais, estaduais, nacionais ou internacionais aplicáveis;</li>
                <li>Hospedar, distribuir ou promover conteúdo ilegal, difamatório, ameaçador ou que infrinja direitos autorais;</li>
                <li>Tentar interferir na segurança ou integridade técnica do sistema;</li>
                <li>Comercializar produtos proibidos por lei.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Assinaturas e Pagamentos</h2>
              <p>
                Alguns recursos da PlataformaCard estão sujeitos ao pagamento de assinaturas. Os valores, ciclos de faturamento 
                e políticas de cancelamento estarão descritos no painel de gestão financeira do usuário. O não pagamento 
                poderá resultar na suspensão temporária ou cancelamento da conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Propriedade Intelectual</h2>
              <p>
                A estrutura, design, código fonte e logotipos da PlataformaCard são de nossa propriedade exclusiva. 
                O conteúdo, imagens e dados dos produtos cadastrados pelo usuário são de responsabilidade e propriedade do próprio usuário.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Limitação de Responsabilidade</h2>
              <p>
                A PlataformaCard não se responsabiliza por lucros cessantes, perdas de dados ou danos indiretos resultantes 
                do uso ou da incapacidade de uso do serviço. Nós atuamos apenas como provedores da tecnologia de vitrine digital, 
                não tendo responsabilidade sobre as transações entre você e seus clientes finais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Modificações dos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Notificaremos os usuários sobre 
                alterações significativas. O uso continuado da plataforma após tais modificações constitui sua aceitação 
                dos novos termos.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
