# Guia de Inicialização (Bootstrap): Rede Social de Paróquias

Este guia contém as instruções passo a passo para utilizar o documento [parish_network_architecture.md](file:///c:/Users/Start/plataformacard/template estrutural/parish_network_architecture.md) como base e criar o novo projeto do zero, reaproveitando os motores e padrões consolidados na **PlataformaCard**.

---

## 🚀 Passo 1: Inicialização do Projeto Next.js

1. Crie uma pasta vazia para o novo projeto no seu computador (fora deste workspace).
2. Abra o terminal nessa nova pasta e execute o comando de criação do Next.js (utilizando o App Router, TypeScript e Tailwind CSS):
   ```bash
   npx -y create-next-app@latest ./ --typescript --tailwind --eslint --src-dir=false --app
   ```
3. Instale as dependências essenciais do Supabase no novo projeto:
   ```bash
   npm install @supabase/ssr @supabase/supabase-js lucide-react framer-motion
   ```

---

## 🗄️ Passo 2: Setup do Banco de Dados no Supabase

1. Crie um novo projeto no painel do [Supabase](https://supabase.com).
2. Vá no **SQL Editor** do novo projeto e execute os scripts de criação de tabelas (`parishes`, `communities`, `profiles`, `posts`, `sacrament_requests` e `mass_intentions`) fornecidos na **Seção 2** do documento arquitetônico.
3. Crie as chaves de conexão local copiando o arquivo `.env.example` da PlataformaCard para o novo projeto como `.env.local` e substituindo as credenciais:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```

---

## ⚙️ Passo 3: Copiando os Componentes de Infraestrutura (Motores)

Você pode copiar os seguintes arquivos do projeto **PlataformaCard** diretamente para a estrutura do seu novo projeto para economizar dezenas de horas de desenvolvimento:

1. **Conexão com o Supabase (Singleton):**
   * Copie o arquivo `lib/supabase/client.ts` do PlataformaCard para a pasta `lib/supabase/client.ts`. Esse arquivo impede a recriação múltipla de instâncias do Supabase durante o Fast Refresh do Next.js.
2. **Estilo CSS Global & Temas (Dark/Light):**
   * Copie o conteúdo do arquivo `globals.css` do PlataformaCard para o `app/globals.css` do novo projeto. Isso trará todo o sistema de CSS Variables de cores, gradientes e arredondamentos modernos que já foram validados.
3. **Middleware de Roteamento Protegido:**
   * Copie o `middleware.ts` do PlataformaCard para a raiz do novo projeto para controlar o acesso às rotas do `/dashboard` com base no login ativo no Supabase.

---

## 🗺️ Passo 4: Estrutura de Pastas e Roteamento Multitenant

Crie a estrutura de rotas sob o diretório `app/` para segmentar o painel administrativo da área pública das paróquias:

*   `app/[slug]/page.tsx` — **Portal Público da Paróquia:** A tela inicial do fiel (Home da paróquia acessada por `/[slug]`, como `/catedral-colatina`).
*   `app/[slug]/comunidade/[communitySlug]/page.tsx` — **Portal da Capela Filiada:** Filtro específico para a capela de bairro mostrar suas notícias e missas exclusivas.
*   `app/dashboard/` — **Painel Admin:** Layout administrativo geral (Secretaria).
*   `app/login/` — **Tela de Login:** Fluxo de login híbrido (OTP de 6 dígitos para fiéis e senha para secretaria).

---

## 🔑 Passo 5: Implementando o Fluxo de Login OTP

No arquivo da tela de login, implemente duas abas ou fluxos distintos:

1. **Aba Fiel (Sem Senha):**
   * Exibe apenas um campo de E-mail (ou Telefone).
   * Chama `supabase.auth.signInWithOtp` para disparar o token.
   * Redireciona o usuário para uma tela simples com input de 6 dígitos que chama `supabase.auth.verifyOtp`.
2. **Aba Secretaria (Com Senha):**
   * Exibe E-mail e Senha.
   * Chama `supabase.auth.signInWithPassword`.
   * Envia o usuário diretamente para a rota `/dashboard`.
