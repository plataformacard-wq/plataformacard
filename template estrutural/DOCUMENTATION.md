# Casa Digital Paroquial - Protocolo de Desenvolvimento (SSOT)

## 1. Visão Geral
Este documento serve como a **Fonte Única de Verdade (SSOT)** para a arquitetura, regras de negócio e estabilização da plataforma de rede social e portal de avisos para paróquias e comunidades.

## 2. Padrões de Interface (UI/UX)
- **Acessibilidade para Todos (Fiéis):** Como o público da igreja abrange pessoas idosas, o contraste tipográfico deve ser máximo. Fontes com tamanhos confortáveis (mínimo `14px` para textos corridos, ideal `16px` no mobile).
- **Esquema de Cores Sóbrio e Litúrgico:** 
  - Fundo principal (Tema Claro): `#fcfcfc` com superfícies em branco puro `#ffffff`.
  - Fundo principal (Tema Escuro): `#09090b` com superfícies em `zinc-900/950` (`#18181b`).
  - Cores de Destaque: Azul eclesial escuro, dourado litúrgico ou verde oliva dependendo da paróquia.
- **Modais e Portais (Stacking Context):**
  - Toda modal (ex: solicitação de sacramento, formulário de intenção) que precise cobrir 100% da tela DEVE ser renderizada via **React Portals** (`createPortal(..., document.body)`) para evitar quebra de layout de z-index em visualizações PWA ou embeds.

## 3. Segurança e Dados (RLS)
- **Isolamento de Tenants:** Todo insert na tabela `posts`, `sacrament_requests` ou `mass_intentions` deve carregar obrigatoriamente o `parish_id` do perfil do usuário logado.
- **Políticas de Leitura:** Fiéis só podem ler posts da paróquia ativa. Visitantes anônimos só leem posts marcados como `status = 'published'` e de paróquias com status ativo.

## 4. Estrutura de Roteamento Dinâmico (App Router)
- `/[slug]` -> Renderiza o portal público da paróquia.
- `/[slug]/comunidade/[communitySlug]` -> Filtra avisos e horários específicos de uma capela/comunidade filial.
- `/dashboard` -> Painel de controle da secretaria da paróquia.
- `/login` -> Fluxo híbrido com OTP de 6 dígitos para fiéis e senha para secretaria.

## 5. Dízimo e Ofertas (Experiência Humana)
- O fluxo de doação deve exibir mensagens personalizadas focadas em gratidão e acolhimento em vez de alertas de faturamento frios de e-commerce.
