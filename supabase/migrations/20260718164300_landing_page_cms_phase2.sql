-- 1. Modificar landing_page_settings
ALTER TABLE public.landing_page_settings
ADD COLUMN IF NOT EXISTS hero_mockup_url text,
ADD COLUMN IF NOT EXISTS social_instagram text,
ADD COLUMN IF NOT EXISTS social_facebook text,
ADD COLUMN IF NOT EXISTS social_linkedin text,
ADD COLUMN IF NOT EXISTS social_youtube text,
ADD COLUMN IF NOT EXISTS social_tiktok text,
ADD COLUMN IF NOT EXISTS social_x text;

-- 2. Modificar landing_page_testimonials
ALTER TABLE public.landing_page_testimonials
ADD COLUMN IF NOT EXISTS image_url text;

-- 3. Criar landing_page_faqs
CREATE TABLE IF NOT EXISTS public.landing_page_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Criar landing_page_plans
CREATE TABLE IF NOT EXISTS public.landing_page_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_text text NOT NULL,
  subtitle text NOT NULL,
  badge_text text,
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'green')),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  button_text text NOT NULL,
  button_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.landing_page_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Public Read Access for FAQs" ON public.landing_page_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Access for Plans" ON public.landing_page_plans FOR SELECT USING (is_active = true);

-- 5. SEED DATA (Preenchimento de FAQs, Depoimentos e Planos Iniciais)

-- 5.1 SEED FAQs
INSERT INTO public.landing_page_faqs (question, answer, display_order) VALUES
('O que é o catálogo digital da PlataformaShop?', 'É uma versão interativa e sempre atualizada do seu catálogo de produtos em PDF. Em vez de enviar arquivos pesados pelo WhatsApp, você envia um link rápido onde o cliente pode ver fotos, preços em tempo real e até montar um pedido que cai direto no WhatsApp do vendedor.', 1),
('Preciso pagar taxas sobre as vendas?', 'Não! A PlataformaShop não é um marketplace nem um gateway de pagamento que cobra comissões. Nós fornecemos a tecnologia de vitrine digital. As negociações e pagamentos continuam acontecendo diretamente entre você e seu cliente no WhatsApp, com 0% de taxa.', 2),
('Meus clientes precisam baixar algum aplicativo?', 'De forma alguma. O catálogo funciona diretamente no navegador de qualquer smartphone, tablet ou computador. O cliente clica no link e a vitrine abre instantaneamente, sem atritos ou barreiras.', 3),
('Posso usar a PlataformaShop para minha equipe de representantes?', 'Com certeza. No plano Enterprise, oferecemos a gestão de "Master Catalog". Você atualiza um preço ou produto no painel central e isso reflete instantaneamente nos links individuais de todos os seus vendedores ou franqueados.', 4),
('Como funciona a integração com NFC?', 'Ao adquirir nossos cartões ou tags NFC físicos, basta encostá-los no celular de um cliente em uma reunião presencial. O celular abrirá automaticamente a sua vitrine digital da PlataformaShop na tela dele, causando um impacto altamente profissional.', 5);

-- 5.2 SEED Depoimentos (Se a tabela estiver vazia, ou só insere sem duplicar muito, vamos fazer um insert sem ON CONFLICT pois é UUID random, e não sabemos a restrição, mas podemos fazer INSERT)
-- O ideal para não duplicar toda vez que o script rodar, é deletar os fakes anteriores se quisermos, mas como é um seed único, vamos só inserir.
INSERT INTO public.landing_page_testimonials (text, name, initials, color, stars, is_active) VALUES
('O app é muito bom, oferece funcionalidade prática com ótimos recursos. É fácil de usar e principalmente fácil de divulgar para os clientes. Recomendo muito.', 'Anderson Cavalcante', 'AC', 'bg-indigo-500', 5, true),
('Uma quantidade absurda de praticidade! Enviar o link pelo WhatsApp e o cliente já abrir o catálogo na hora salvou minhas vendas do mês. App perfeito.', 'Gustavo Brandão', 'GB', 'bg-blue-500', 5, true),
('Excelente! Me ajuda demais a alcançar mais clientes com apenas um clique. Acabou aquele sofrimento de enviar PDF pesado que ninguém baixava.', 'Solange Cespedes', 'SC', 'bg-emerald-500', 5, true),
('Fácil e prático. Melhor plataforma B2B da categoria. A equipe de suporte também é fantástica.', 'Ari Ferraresi', 'AF', 'bg-purple-500', 5, true),
('Adorei a plataforma; é muito fácil e útil de usar. Qualquer distribuidor pode centralizar os preços em segundos. Mágico!', 'Rafael B.', 'RB', 'bg-orange-500', 5, true),
('Eu amo! Exatamente o que eu procurava, muito útil para minha equipe de vendas de campo.', 'Camila Sánchez', 'CS', 'bg-rose-500', 5, true),
('É um ótimo app. Me permite manter todos os orçamentos e produtos da loja organizados de forma extremamente eficiente.', 'Oliver Roth', 'OR', 'bg-cyan-500', 5, true),
('Impressionante como algo tão simples mudou o faturamento da minha loja de autopeças. Ninguém quer ver tabela de excel, querem catálogo limpo igual o da PlataformaShop.', 'Michelle Beckdorf', 'MB', 'bg-violet-500', 5, true);

-- 5.3 SEED Planos
INSERT INTO public.landing_page_plans (name, price_text, subtitle, badge_text, theme, features, button_text, button_url, display_order) VALUES
('Start (Para Autônomos)', 'Grátis', 'Ideal para vendedores independentes e pequenos negócios locais.', NULL, 'dark', '["Até 20 produtos no catálogo", "1 Vitrine Digital Exclusiva", "Botão direto para o seu WhatsApp", "Tema Dark Mode Padrão"]'::jsonb, 'Criar Conta Grátis', '/cadastro', 1),
('Enterprise (CaaS)', 'Customizado', 'Para distribuidoras, franquias e equipes comerciais que exigem controle total.', 'Recomendado para Empresas', 'green', '["Produtos Ilimitados (Master Catalog)", "Dezenas de vendedores sincronizados", "Gestão centralizada de preços", "Prioridade de Suporte Técnico"]'::jsonb, 'Falar com Especialista', 'https://wa.me/5527999999999?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20da%20PlataformaShop%20para%20minha%20empresa.', 2);
