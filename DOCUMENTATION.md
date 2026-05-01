# Status Report: PlataformaCard 🚀

Este documento descreve o estado atual do desenvolvimento, as tecnologias utilizadas, o escopo consolidado e os próximos passos do projeto.

---

## 1. Fase Atual
O projeto encontra-se na fase de **Consolidação e Refinamento de UX/UI**. Após a implementação das funcionalidades base (Auth, CRUD de produtos, Perfis), o foco mudou para a robustez da plataforma SaaS, incluindo gestão de limites por plano, automação de onboarding e ferramentas avançadas de administração (Super Admin).

---

## 2. Escopo Atualizado

### 🛡️ Core & Modelos de Negócio
- **Plataforma Híbrida**: Suporte a três modelos principais:
    - **B2C (Cartão Digital)**: Foco em perfis pessoais e networking.
    - **B2B (Gestão de Vendas)**: Foco em times de vendas e hierarquia organizacional.
        - **Conceito "Mini-site por Vendedor"**: Cada vendedor possui sua URL única (`/josegabriel`) como ferramenta de fechamento e pós-venda.
        - **Descentralização**: O Admin orquestra o catálogo, mas o vendedor é o protagonista da interação na ponta.
        - **Acesso Delegado**: Capacidade de conceder acesso parcial ao dashboard para vendedores (Gestão de Catálogo, Analytics, etc).
    - **CaaS (Catalog as a Service)**: Modo catálogo puro para vitrines digitais. No plano Master, permite a implementação via iframe em sites externos.
- **Multi-tenancy**: Separação completa de dados por conta/empresa.
- **RBAC (Controle de Acesso)**: Papéis de Super Admin, Gestor, Vendedor e `caas_admin`.
- **Blindagem**: Sistema de proteção e integridade para catálogos e acessos.

## 🛡️ Protocolo de Robustez e Qualidade (Solo Dev)
Para garantir que o projeto seja sustentável para um desenvolvedor solo, seguimos rigorosamente este protocolo em cada nova implementação:

1. **Componentização Estratégica**: Evitar arquivos gigantes. Funcionalidades complexas (Modais, Drawers, Grids) devem ser extraídas para componentes menores e reutilizáveis.
2. **Clean Code & Documentação**: Lógicas críticas, cálculos de preço ou integrações com o banco devem conter comentários explicativos ("O porquê" e não apenas "o quê").
3. **Refatoração Preventiva**: Antes de cada grande mudança, avaliamos a saúde do arquivo. Se houver dívida técnica ou desorganização, a limpeza precede a nova funcionalidade.
4. **Segurança no Banco (RLS)**: Toda lógica de visibilidade deve ser espelhada nas políticas de Row Level Security do Supabase, garantindo que o front-end seja apenas um reflexo da segurança do back-end.

## 🛡️ Diretrizes de Interação com o Agente (IA)
Para garantir a eficiência e o controle do desenvolvedor sobre o ambiente, o agente deve seguir as seguintes premissas:

1.  **Uso do Navegador**: Sem demonstrações automáticas no navegador, a não ser que seja extremamente necessário para a resolução de um problema técnico que não possa ser diagnosticado via código ou logs.
2.  **Prioridade de Código**: O diagnóstico deve sempre priorizar a análise estática de arquivos e logs do terminal antes de recorrer à interface visual.

---

### 📊 Dashboard do Usuário (Gestor/Vendedor)
- **Catálogo Inteligente**: Edição em massa de produtos (Bulk Editor) via interface tipo planilha.
- **Gestão de Imagens**: Sistema de upload com crop automático e compressão no cliente para otimização de storage.
- **Analytics**: Visualização de acessos e performance do catálogo.
- **Onboarding**: Fluxo guiado para novos usuários configurarem sua empresa e produtos.

### 🧠 Centro de Inteligência (Super Admin)
- **BI Analytics**: Visão global da saúde da plataforma, segmentada por B2B, B2C e CaaS.
- **Client Raio-X**: Detalhamento de contratos, vencimentos e histórico operacional de cada cliente.
- **Gestão de Vitrines (CaaS)**: Controle centralizado de implementações de catálogos.
- **Manutenção Global**: Sistema de notificações e bloqueios para manutenção do sistema.

---

## 3. Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript |
| **Frontend** | React 19 / Tailwind CSS 4 |
| **Animações** | Framer Motion |
| **Backend/BaaS** | Supabase (Auth, Postgres, Storage, Edge Functions) |
| **Gerenciamento de Estado** | React Hooks / Supabase Context |
| **Manipulação de Imagens** | react-easy-crop / browser-image-compression |
| **Tabelas** | TanStack Table (v8) |

---

## 4. Pendências de Programação (Backlog Técnico)

1.  **Refinamento de RBAC**: Garantir que o `AccessManager` bloqueie dinamicamente ações baseadas no plano contratado.
2.  **Sincronização de Sidebar**: Pequenos ajustes na indicação de item ativo quando há mudanças via hash da URL.
3.  **Logs de Auditoria**: Implementar rastreamento de alterações críticas feitas por vendedores/gestores.
4.  **Otimização de Performance**: Lazy loading mais agressivo no Bulk Editor para catálogos com +500 itens.
5.  **Notificações em Tempo Real**: Implementar via Supabase Realtime alertas para novos acessos ou atualizações do sistema.
6.  **Gestão de Domínios (White-label)**: Implementar lógica técnica para suportar domínios customizados (ex: `anotameucontato.com.br`) via proxy ou CNAME.
7.  **Implementação de Níveis de Acesso (B2B)**: Adicionar controles de permissão no card de vendedor para delegar gestão de catálogo, analytics e configurações da empresa.
8.  **Validação CaaS (Maj Mobilidade)**: Testar a implementação real via iFrame no site oficial após o cadastro completo do catálogo de produtos.
9.  **Ajuste de Favicon**: Resolver a persistência de cache agressivo de Favicon nos navegadores que impede a atualização visual imediata mesmo com timestamps.

---

## 5. Plano de Implementação em Andamento

### 🚀 Curto Prazo (Próximos Dias)
- **Implementação do Fluxo CaaS**: Refinar o onboarding e dashboard específico para o modo catálogo (foco em Logo/Vitrine).
- **Finalização do Onboarding**: Garantir que 100% dos novos usuários completem o perfil antes de acessar o dashboard.
- **Estabilização da Gestão de Limites**: Bloqueio automático de criação de produtos ao atingir o limite do plano.
- **Ajustes de UI**: Padronização final de modais e botões seguindo o novo `PanelLayout`.

### 🎯 Médio Prazo (Próximas Semanas)
- **Otimização do Fluxo CaaS**: Refinar o onboarding específico para o modo catálogo (foco em Logo e Vitrine em vez de perfil pessoal).
- **Lançamento da Versão Beta Protegida**: Liberação para usuários selecionados (como o usuário "Maj") com verificação de e-mail obrigatória.
- **Documentação Master**: Consolidação final da lógica de negócio para futuras expansões de equipe.
- **Automação de Renovação**: Integração de gatilhos para expiração de contratos no Super Admin.

---

## 7. Modelo de Planos e Precificação (Rascunho Inicial)

> [!IMPORTANT]
> Os dados abaixo representam um **esboço estratégico inicial** para fins de planejamento. Estes planos, limites e valores são **passíveis de modificações** de acordo com a validação de mercado e necessidades operacionais.

### 💎 Tabela de Planos Sugerida

| Recurso | **Essential (B2C)** | **Pro Business (B2B)** | **Master (B2B+ / CaaS)** |
| :--- | :--- | :--- | :--- |
| **Vendedores** | 1 (Titular) | Até 10 Vendedores | Ilimitado |
| **Produtos** | Até 30 produtos | Até 150 produtos | Ilimitado |
| **Domínio** | `anotameucontato.com.br/slug` | Subdomínio Customizado ✅ | Subdomínio Customizado ✅ |
| **CaaS (Embed)** | ❌ | ❌ | ✅ Iframe para Site Externo |
| **Destaque** | Cartão Pessoal | Gestão de Pequena Equipe | Consultoria e Escala |
| **Suporte** | E-mail | WhatsApp Prioritário | Gerente de Conta VIP |

### 🛠️ Definição de Serviços Estratégicos

- **Gerente de Conta (Exclusivo Enterprise):** Atua como um parceiro de *Customer Success*. Responsável pelo Onboarding VIP (carga de dados inicial), consultoria mensal de performance baseada em Analytics e treinamento direto das equipes de venda.
- **Módulo BI Avançado:** Disponível nos planos Pro e Enterprise, oferecendo inteligência de dados sobre conversão de leads e performance individual de vendedores.

---

## 8. Design System e Padrões de Tema (Themes)

A plataforma utiliza um sistema unificado de temas com duas identidades visuais distintas e marcantes. O controle global do tema é feito através de CSS puro (`globals.css`) integrado com as variáveis do TailwindCSS.

### Padrão Oficial (Modo Escuro / Premium)
- **Onde atua**: É o padrão padrão ("default") de todo o sistema.
- **Identidade**: Baseado na estética do Cartão Público, entregando um visual premium e noturno.
- **Paleta de Cores**: Fundo negro absoluto (`#0a0a0a`) com degradê radial na cor verde esmeralda escuro (`#0d3b1f`), acentuado pelo verde neon (inspirado no WhatsApp, `#25D366`) como cor primária (`text-primary`, `bg-primary`).
- **Superfícies**: Utiliza *Glassmorphism* (efeitos de vidro) com opacidade extremamente controlada (`rgba(255, 255, 255, 0.035)`) para manter o contraste luxuoso sem clarear o fundo.

### Padrão Alternativo (Modo Claro / Clean)
- **Onde atua**: Acionado via *Theme Toggle* (`PublicThemeToggle` ou Dashboard TopHeader). O estado é salvo em cache via `localStorage("dash-theme")`.
- **Identidade**: Baseado na estética Clean/Minimalista corporativa.
- **Paleta de Cores**: Fundo branco ou levemente acinzentado (`#f8fafc`, `#ffffff`) com textos em cinza escuro/slate (`#0f172a`, `#475569`).
- **Superfícies**: Utiliza bordas sólidas (`#e2e8f0`) e sombras tradicionais no lugar de transparências.

> **Engenharia do CSS**: Para preservar a perfeição pixel-a-pixel do Cartão Público no modo escuro (evitando conflitos de Tailwind no catálogo), foi criada a classe utilitária `.public-theme-invert` em `globals.css`. Esta classe atua unicamente injetando as variáveis do modo Claro nas páginas públicas apenas quando o `[data-theme="dark"]` não estiver presente.

---

## 9. Registro de Alterações (Log)

| Data | Alteração | Responsável |
| :--- | :--- | :--- |
| 2026-04-24 | Criação do documento e definição de escopo (B2B, B2C, CaaS). | Antigravity |
| 2026-04-24 | Bugfix: Correção de erro de tipagem no build do Vercel (CatalogoClient.tsx). | Antigravity |
| 2026-04-24 | Bugfix: Correção de importação ausente do ícone Clock (PanelLayout.tsx). | Antigravity |
| 2026-04-25 | Padronização de Branding: Atualização de links e previews para o domínio oficial `anotameucontato.com.br`. | Antigravity |
| 2026-04-25 | Evolução B2B: Refatoração da listagem de vendedores para cards retangulares com toggle de status e analytics. | Antigravity |
| 2026-04-25 | Estratégia: Definição do rascunho inicial de Planos, Limites e Serviços (Gerente de Conta). | Antigravity |
| 2026-04-27 | UI/UX: Unificação do Design System (Modo Claro/Escuro), Integração CaaS e refatoração do `globals.css` com suporte a `public-theme-invert`. | Antigravity |
| 2026-04-29 | Escopo: Adição da funcionalidade de Acesso Delegado ao Dashboard para Vendedores (B2B). | Antigravity |
| 2026-04-29 | Arquitetura: Reestruturação do CaaS como extensão do plano Master com suporte a iFrame Embed. | Antigravity |
| 2026-05-01 | SEO & Branding: Refatoração da página de SEO, implementação de metadados dinâmicos e registro de pendência de cache de Favicon. | Antigravity |

---

> [!NOTE]
> Este documento é dinâmico e deve ser atualizado a cada grande marco de desenvolvimento.
