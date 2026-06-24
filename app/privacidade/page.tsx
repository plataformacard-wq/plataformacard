import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade | PlataformaCard",
  description: "Política de Privacidade e Proteção de Dados (LGPD)",
};

export default function PrivacidadePage() {
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
          <h1 className="mb-8 text-3xl sm:text-4xl font-black tracking-tight">Política de Privacidade</h1>
          
          <div className="prose prose-invert prose-emerald max-w-none space-y-6 text-zinc-300">
            <p className="text-sm font-medium text-zinc-400">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            
            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Nosso Compromisso com a Privacidade</h2>
              <p>
                A PlataformaCard está comprometida em proteger a sua privacidade e os seus dados pessoais, operando em conformidade 
                com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Dados que Coletamos</h2>
              <p>Coletamos os seguintes tipos de informações:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Dados de Conta:</strong> Nome, e-mail, telefone (WhatsApp) e senha criptografada.</li>
                <li><strong>Dados de Negócio:</strong> Informações do seu catálogo, produtos, preços e descrições inseridas na plataforma.</li>
                <li><strong>Dados de Uso:</strong> Logs de acesso, endereço IP temporário e interações com o sistema para fins de auditoria e segurança.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Como Utilizamos os Dados</h2>
              <p>Os seus dados são utilizados estritamente para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Prestar, operar e manter os serviços da plataforma;</li>
                <li>Permitir o acesso seguro ao seu painel administrativo;</li>
                <li>Processar pagamentos e gerar faturas (através de parceiros homologados);</li>
                <li>Prevenir fraudes e garantir a segurança do ambiente;</li>
                <li>Comunicar atualizações importantes e avisos sobre a sua assinatura.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Compartilhamento de Informações</h2>
              <p>
                Nós não vendemos, alugamos ou comercializamos os seus dados pessoais. Podemos compartilhar dados 
                estritamente necessários apenas com fornecedores de infraestrutura técnica (ex: servidores de banco de dados, 
                gateways de pagamento) que também estão em conformidade com as leis de proteção de dados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Seus Direitos (LGPD)</h2>
              <p>Como titular dos dados, você tem o direito de:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Confirmar a existência de tratamento de dados;</li>
                <li>Acessar, corrigir ou atualizar os seus dados através do próprio painel (Dashboard);</li>
                <li>Solicitar a exclusão definitiva da sua conta e anonimização dos dados ("Direito ao Esquecimento");</li>
                <li>Revogar consentimentos concedidos anteriormente.</li>
              </ul>
              <p className="mt-2 text-sm text-zinc-400">
                A opção de exclusão da conta pode ser feita diretamente na área de configuração do sistema ou solicitada ao nosso suporte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Segurança e Armazenamento</h2>
              <p>
                Utilizamos as melhores práticas do mercado, incluindo criptografia em repouso e em trânsito e controle 
                rígido de acesso aos bancos de dados através de políticas (RLS), para garantir que seus dados não sejam 
                acessados de maneira não autorizada.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Contato</h2>
              <p>
                Se você tiver dúvidas, solicitações ou quiser exercer seus direitos sobre nossa Política de Privacidade, 
                entre em contato com nosso time de suporte.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
