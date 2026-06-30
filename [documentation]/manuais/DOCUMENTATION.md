# PlataformaShop - Protocolo de Estabilização B2C (Essential)

## 1. Visão Geral
Este documento serve como a **Fonte Única de Verdade (SSOT)** para a arquitetura e estabilização da plataforma, focando no modelo B2C Individual (Essential).

## 2. Padrões de Design e Temas
- **Modo Escuro (Dark Mode):** 
  - Fundo principal: `#0a0a0a` com gradiente radial `#0d3b1f`.
  - Superfícies (Cards): `var(--dash-surface)` (zinc-900/950).
  - Inputs: `var(--dash-input-bg)` fixado em `#1a1a1a` para evitar glitches visuais.
- **Identidade Visual:** 
  - Cor primária: Emerald-500 (Verde premium).
  - Indicadores ativos na Sidebar: Sempre `emerald-500` com glow sutil.

## 3. Segurança e Dados (RLS)
- **Criação de Catálogo:** Todo insert na tabela `catalogs` DEVE incluir explicitamente o `owner_id: user.id` para cumprir as políticas de Row Level Security (RLS).
- **Contas de Emergência:** O sistema utiliza fallbacks automáticos via `user_metadata` caso o registro na tabela `profiles` demore a sincronizar.

## 4. Navegação e Sidebar
- **Analytics:** Visível por padrão para todos os níveis de gestão.
- **Filtros de Menu:** Itens de equipe (Vendedores) são ocultados automaticamente para perfis `b2c_admin`.
- **Indicador Ativo:** Uma barra lateral verde de 4px de largura deve ser renderizada à esquerda de qualquer item de menu ou submenu ativo.
- **Ordem dos Menus (Padrão):** 
  1. Dashboard
  2. Empresa
  3. Catálogo
  4. Vendedores (Apenas B2B)
  5. Editar Cartão Público (Apenas B2C)
  6. Perfil (Penúltimo)
  7. Analytics (Último)

## 5. Lógica de Disponibilidade e Horários
O sistema utiliza uma hierarquia de três níveis para determinar se um catálogo está aberto:
1.  **Status Manual:** Se `is_available` for `false` no perfil, o catálogo fica "Pausado" (sempre fechado).
2.  **Permissão de Customização:** Se `can_customize_hours` for `true` e houver horários configurados no perfil, estes têm prioridade.
3.  **Herança da Empresa:** Caso o vendedor não tenha permissão ou não tenha configurado horários, o sistema herda os horários da `Organization`.
4.  **Fallback de Segurança:** Se nem o vendedor nem a empresa tiverem horários salvos, o sistema aplica o `DEFAULT_BUSINESS_HOURS` (Seg-Sex 08-18h, Sáb 08-12h) para evitar catálogos "sempre abertos" por erro de configuração.
5.  **Sistema Inteligente de Feriados (Novo):** A gestão de feriados reside no objeto `holiday_settings` de `organizations.business_hours`.
    - Ao ativar o fechamento em Feriados Nacionais, o sistema consulta a BrasilAPI no Dashboard.
    - Se houver um feriado iminente (dentro de 60 dias), o gestor pode configurar "Alertas Customizáveis" em sequência, usando o campo `advanceDays` de cada alerta para exibir mensagens estratégicas para o time B2B ou B2C.
    - Faltando 7 dias para o feriado, o vendedor recebe um Card de Decisão onde salva sua preferência em `holiday_decisions` no perfil.
    - Se a decisão for "Vou folgar", o sistema força `isRecessActive = true` nas rotas públicas (Catálogo e Vitrine), acionando imediatamente as pausas e roteamento de leads para aquele dia específico, via fuso horário "America/Sao_Paulo".

## 6. Prevenção de Regressões (Protocolo de Resiliência)
- **Prevenção de Monolitos (Code Health):** A cada 5 invocações do `protocolo start`, o assistente executará automaticamente uma varredura para identificar arquivos TypeScript/TSX com mais de 500 linhas, sugerindo um plano de refatoração para evitar acúmulo de débito técnico. O contador está mantido em `app/_protocol/protocol_state.json`.
- **Suspense Boundaries:** Obrigatório o uso de `Suspense` em componentes que utilizam `useSearchParams` ou dados dinâmicos de BI (ex: Analytics).
- **Hooks Management:** Nunca chamar hooks (`useState`, `useEffect`) dentro de condicionais ou após retornos antecipados. Centralizar todos no topo do componente.
- **Tokenização:** Proibido o uso de cores hexadecimais fixas no JSX. Sempre usar tokens CSS (`var(--dash-...)`).

## 7. Arquitetura Modular (Refatoração)
- **Extração de Modais:** Componentes complexos (ex: `ProductModal`, `CategoryModal`) devem ser extraídos para arquivos dedicados em `components/dashboard/`.
- **Comunicação via Props:** A comunicação deve ocorrer estritamente via props (`isOpen`, `onClose`, `onSuccess`), mantendo o componente pai (`CatalogoClient`) como orquestrador de dados.
- **Persistência de Rascunhos:** Formulários complexos devem utilizar `localStorage` para persistir rascunhos de descrições e especificações, evitando perda de dados em caso de refresh acidental.
- **Separação de Preocupações:** O cliente principal foca na listagem e filtros; os modais focam no CRUD e interações específicas (IA, Uploads).
- **Prioridade de Resolução de Catálogo:** Para vendedores B2C ou perfis individuais, a aplicação resolve os catálogos sempre verificando primeiro o vínculo explícito na tabela `profile_catalogs` (`is_selected: true`). Apenas se não houver vínculo específico é que o sistema fará fallback para os catálogos ativados da `organization_catalogs` mãe.
- **Estratégia de Bulk Overrides:** Ao herdar catálogos Master (CaaS), os produtos são ocultados por padrão. Para aprovar lotes de produtos, foi instituída a técnica de Bulk Upsert (Tornar Todos Visíveis) que realiza inserções otimizadas na tabela `organization_product_overrides`, mitigando o peso de múltiplas requisições.


## 8. Tipografia e Quebra de Palavras (Word Wrapping)
- **Problema Recorrente**: Quebras abruptas de palavras no catálogo devido ao uso indiscriminado de `word-break: keep-all` misturado com HTML gerado pelo editor Rich Text (React Quill) ou spans do Tailwind.
- **Padrão Ouro Estabelecido**: 
  - NUNCA use `word-break: keep-all` ou `word-break: break-all` em áreas de descrição ricas.
  - O correto para layouts premium no projeto é: `overflow-wrap: break-word` acompanhado de `word-break: normal` e `hyphens: auto`.
  - **Sanitização de HTML**: Todo texto, inclusive o `description` em HTML retornado do banco, DEVE passar pelo `sanitizeText` antes do render (ex: `dangerouslySetInnerHTML={{ __html: sanitizeText(product.description) }}`). A regex foi atualizada para corrigir typos do usuário como "EMPLACA MENTO".
  - *Para mais detalhes, consulte o Knowledge Item (KI) "text_wrapping_strategy".*

## 9. Renderização de Modais e Overlays (Popups)
- **O Problema do Stacking Context**: O uso de animações (`framer-motion`), `transform`, ou `filter` em componentes da UI gera um isolamento de contexto no CSS (Stacking Context). Isso faz com que modais com `position: fixed` sejam "cortadas" e não cubram toda a tela do usuário.
- **Padrão Ouro Estabelecido (React Portals)**:
  - TODA modal ou overlay que deve cobrir 100% da viewport **deve** usar `createPortal(..., document.body)`.
  - O overlay deve ser fixado em preto puro com altíssima opacidade (ex: `bg-black/90` e `z-[9999]`) e implementar fechamento ao clique externo.
  - O componente deve garantir que está `mounted` via `useEffect` antes de invocar o Portal para evitar erros de hidratação no Next.js (SSR).
- **Esquema de Cores Absoluto (Sem Transparência)**:
  - Modais interativas sobre o catálogo NÃO DEVEM usar fundos semi-transparentes ou depender da cascata de CSS Modules se renderizadas via Portal, pois o portal perde o escopo da classe `data-theme` aplicada em contêineres internos.
  - Para o fundo da modal (caixa principal), use **Inline Styles** forçando a cor baseada na leitura direta do DOM para contornar falhas de cache ou de variáveis não resolvidas no Tailwind v4.
  - Exemplo Padrão: `style={{ backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#18181b' : '#ffffff' }}`.
  - O objetivo é criar blocos sólidos de informação que interrompem o fluxo (Frustração UX), com animações de Scale Up + Spring (via `AnimatePresence`) para atenuar o impacto visual.

### 9.1 Comportamento Responsivo do Detalhe de Produtos (Embed vs Standard)
Para garantir uma experiência de navegação otimizada e evitar bugs de rolagem (double scrollbars e clipping) causados pelo encapsulamento em iFrames, a exibição de detalhes de produtos adota três comportamentos distintos baseados no contexto (`isEmbed`) e dispositivo (`isMobile` com breakpoint `< 768px`):

1. **Catálogo Padrão (Sem Embed - `isEmbed === false`)**:
   - **Comportamento**: Abre o **Modal Popup Tradicional** centralizado na viewport do navegador.
   - **Responsividade**: Funciona de forma idêntica tanto em Mobile quanto em Desktop.
   - **Características**: Fundo escurecido (`bg-black/80` com `backdrop-blur-md`), padding lateral deixando as bordas da vitrine visíveis e bloqueio de rolagem do body (`overflow: hidden`).

2. **Catálogo Embarcado (Modo Embed - `isEmbed === true`)**:
   - **Mobile (`isMobile === true`)**:
     - **Comportamento**: **Expansão em Sanfona (Inline Accordion)** diretamente no card do produto na vitrine, sem abrir nenhuma modal flutuante.
     - **Rolagem**: Não bloqueia a rolagem do body. Ao ser aberto, a aplicação executa um scroll suave (`scrollIntoView`) para centralizar o card expandido na tela do smartphone após 150ms.
     - **Vantagem**: Evita glitches visuais, quebras de layout dentro de iframes pequenos e barras de rolagem duplas.
   - **Desktop (`isMobile === false`)**:
     - **Comportamento**: Abre o **Modal Popup Tradicional** sobreposto no iFrame, utilizando um sistema de **Posicionamento Relativo Dinâmico (Smart Y-Axis Positioning)**.
     - **O Problema do iFrame Gigante**: iFrames responsivos costumam ter alturas colossais (ex: 5000px) para acomodar todos os produtos sem barra de rolagem interna. Usar o alinhamento clássico (`fixed` + `items-center`) faz o modal ser desenhado no meio exato do iFrame, ficando "escondido" lá embaixo caso o usuário tenha clicado num produto do topo.
     - **A Solução UX**: O sistema intercepta a coordenada exata do clique do mouse (`e.pageY`). O fundo escurecido continua preenchendo os 5000px para isolar a vitrine, mas um `paddingTop` dinâmico é injetado no contêiner da modal.
     - **Características**: A caixa da modal flutua inteligentemente na mesma altura visual do cursor do cliente, garantindo navegação limpa, sem pulos de tela e mantendo as margens (padding) laterais para ver o catálogo desfocado ao fundo.

## 10. Gestão de Recursos e Escalabilidade (Plano Free)
O sistema possui duas camadas de monitoramento no Super Admin:
- **Centro de Inteligência (Dashboard QG):** Foco estratégico e de negócios.
- **Gestão de Recursos:** Foco técnico e de infraestrutura.

**Watchdog Automatizado (Telegram):**
O sistema possui um "Watchdog" via Supabase Edge Functions que monitora a saúde do SaaS a cada 12-24 horas.
- **Thresholds:** 75% (Aviso), 85% (Crítico), 95% (Emergência).
- **Configuração:** Requer `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` nas Secrets do Supabase.

**Pilares de Monitoramento Técnico:**
- **Banco de Dados (DB):** Limite de 500MB (Supabase). Monitorado via contagem de linhas totais.
- **Largura de Banda:** Limite de 100GB/mês (Vercel).
- **Storage:** Gerenciado via compressor integrado.

## 11. Estrutura Estratégica de Planos e Limites (SaaS)
Baseado na restrição de 1GB de Storage e 500MB de Banco de Dados da infraestrutura gratuita (Supabase), a plataforma adota o seguinte modelo de limites para forçar a conversão de B2B sem asfixiar o servidor:

**1. Plano Free / Start (Isca para entrada)**
- **Limite de Produtos:** 20 produtos (Suficiente para testar, insuficiente para catálogos completos).
- **Limite de Vendedores:** 2 perfis (Atende autônomos ou pequenos negócios com até 1 funcionário).
- **Justificativa:** Previne o esgotamento do Storage de Imagens. Mesmo com 1.000 empresas usando o plano gratuito no limite, o consumo de DB seria menor que 10%, e o de Storage ficaria sob controle (~3MB/cliente, assumindo imagens comprimidas). Se fornecêssemos 50 produtos grátis, o storage gratuito de 1GB do Supabase seria consumido por apenas ~130 empresas.

**2. Plano Basic / Profissional**
- **Limite de Produtos:** 50 a 100 produtos.
- **Limite de Vendedores:** 5 a 10 perfis.
- **Justificativa:** Foco no comércio tradicional de pequeno e médio porte. A essa altura, o cliente já está pagando pela plataforma, subsidiando possíveis upgrades da nossa própria infraestrutura no Supabase/Vercel.

**3. Plano Pro / Enterprise**
- **Limite de Produtos e Vendedores:** Ilimitados (ou altos volumes como 1.000 produtos).
- **Justificativa:** Ticket alto B2B (distribuidoras e grandes marcas) que viabiliza financeiramente qualquer custo de infraestrutura isolada ou tiers pagos do Supabase.

## 12. Arquitetura CaaS e Gestão de Franquias (Overrides)
O sistema suporta um modelo de Catálogo como Serviço (CaaS), onde a MAJ atua como Super Admin (Master) e distribui catálogos para franqueados (Organizações). A diretriz principal é o **sigilo de custos** da MAJ aliado à **autonomia de precificação** do franqueado.

**Pilares Arquiteturais:**
1. **Blindagem de Preços:** O franqueado acessa a estrutura do produto CaaS (títulos, descrições, fotos base), mas os preços originais da MAJ são omitidos/ocultados pelo sistema.
2. **Tabela de Overrides (`organization_product_overrides`):** Para ativar um produto CaaS na sua vitrine, o franqueado deve definir sua própria precificação e disponibilidade nesta tabela paralela, sem afetar o produto mestre.
3. **Exibição Inteligente via Cartão Virtual:** O cliente final acessa apenas o link do Cartão do Vendedor (`/[slug]/catalogo`). O sistema identifica automaticamente se deve exibir o preço de atacado (`price_b2b`) ou varejo (`price_b2c`) com base no `business_model` configurado na Organização do Vendedor.
4. **Ocultação de Preços (Negociação WA):**
   - **Individual:** Continua usando as flags de produto (`has_retail` e `has_wholesale` falsas) para focar na negociação via botão do WhatsApp.
   - **Global:** Configuração `hide_prices` no catálogo oculta financeiramente todos os produtos de uma só vez (compatível com B2B, B2C e CaaS).
5. **Permissões Híbridas (Gestão):**
   - **Produtos Próprios:** O franqueado tem CRUD total (pode criar, excluir, duplicar).
   - **Produtos CaaS (MAJ):** Ação restrita. Bloqueado para exclusão/duplicação. O franqueado manipula apenas seus Overrides (Preços, Status, Ordenação e Fotos Complementares).

6. **Associação e Desvinculação Segura (Resiliência DB/UI):** Ao atribuir ou remover um catálogo master (CaaS), o sistema interage exclusivamente com registros do tipo `'platform'` ou `'CaaS'`. Isso impede a remoção inadvertida do catálogo próprio e produtos locais do franqueado. O mapeamento no Super Admin foi ajustado para isolar o catálogo master e o seletor utiliza atualização de rotas (`router.refresh()`) para refletir a persistência imediatamente.
7. **Notificação de Ausência de Catálogo:** Se uma organização for do tipo `CaaS` (modelo franqueado) e estiver sem nenhum catálogo master vinculado, um banner informativo e elegante é exibido no topo do painel do franqueado instruindo a vinculação.

## Filosofia Arquitetural de Equivalência (B2C Admin ≡ B2B Vendedor)
Uma das filosofias centrais da PlataformaShop é a **Equivalência Operacional**.
No escopo do projeto, **a operação de um Vendedor B2B deve ter os mesmos recursos e capacidades de um usuário (Admin) B2C**. 
Ambos possuem o mesmo formato de catálogo vitrine, o mesmo controle de recesso temporário (Modo Férias), as mesmas permissões de horários e as mesmas ferramentas de redirecionamento de links. A única diferença estrutural é que o B2C é dono exclusivo do seu ecossistema, enquanto o Vendedor B2B atua como "filial/franquia" debaixo do guarda-chuva de permissões da Organização B2B. A interface de gerenciamento de ficha/perfil de ambos deve ser **idêntica**, promovendo a unificação visual.

## Hierarquia de Permissões
-   `main_admin`: Deus. Acessa painel QG, cadastra planos, administra todos os assinantes (B2B e B2C), pode logar como qualquer empresa.
-   `b2b_admin`: Identificado no SaaS visualmente como **[Gestor Empresarial]**. Controla a empresa corporativa e os vendedores vinculados.
-   `b2c_admin`: Identificado no SaaS visualmente como **[Gestor Individual]**. Atua de forma autônoma (Essential).
-   `caas_admin`: Identificado no SaaS visualmente como **[Gestor Catálogo]**.

- **2026-06-20:**
  - **Sincronização de Módulos Core:** Integração do sistema de **Banners** no catálogo (upload via Supabase Storage, gestão de exibição), módulo de **Assinaturas** no painel do Dashboard e fluxo de **Onboarding/Setup Principal** (`main-setup`).
  - **Correção de Assets:** Inclusão do `favicon.ico` definitivo para a aplicação.

- **2026-06-19:**
  - **Reestruturação UX do Catálogo (Onboarding B2C/B2B):** Reordenação do menu lateral do Catálogo para induzir a configuração inicial ("Configure seu catálogo") antes da adição de produtos. Modificação dos títulos H1 para consistência com o menu.
  - **Nome do Catálogo Dinâmico:** Inclusão do campo de "Nome do Catálogo" na aba "Geral" das configurações (`ConfiguracoesClient.tsx`), permitindo edição direta pelo franqueado (desvinculando a dependência exclusiva do painel CaaS do Super Admin).

- **2026-06-06:**
  - **Correção do ChunkLoadError (react-quill-new):** Isolado o carregamento de `react-quill-new` em um componente wrapper dedicado (`RichTextEditor.tsx`) importado dinamicamente com `ssr: false` para evitar erros de hidratação e falhas de carregamento de chunk no Turbopack (modo dev) sob rotas dinâmicas como o editor CaaS. Removidos imports não utilizados do editor em `CatalogoClient.tsx`.

- **2026-06-01:**
  - **Correção da Desvinculação CaaS:** Ajustada a Server Action `assignMasterCatalog` para preservar o vínculo do catálogo próprio da franquia ao remover ou atualizar o catálogo master.
  - **Auto-Cura de Catálogo Próprio:** Implementada re-ativação automática de catálogos próprios que porventura tenham sido desativados no banco de dados.
  - **Dropdown do Super Admin:** Corrigido o mapeamento do seletor de CaaS no Super Admin para ignorar o catálogo próprio do franqueado, resolvendo o problema de seleções que "não ficavam" gravadas visualmente.
  - **Banner de Alerta CaaS:** Adicionado banner interativo no painel do franqueado se a organização for CaaS mas não possuir catálogo master ativo.
- **2026-05-19:**
  - **Overlays e Modais (React Portals):** Refatoração da arquitetura de popups no catálogo e perfil (`Consultor Indisponível`) usando `createPortal` para burlar isolamentos de z-index (Stacking Context).
  - **Tematização Sólida Absoluta:** Remoção de transparências em modais injetando leitura direta do DOM (`document.documentElement.getAttribute('data-theme')`) para cores `#ffffff` e `#18181b`.
  - **Animações (Framer Motion):** Implementação de efeitos de Fade-In e Scale-Up (spring) em mensagens de interrupção de UX.
- **2026-05-09:**
  - **UI/UX Premium (Galeria):** Implementação de reordenação por drag-and-drop e novo fluxo de editor que abre antes do seletor de arquivos.
  - **Herança de Horários:** Correção da lógica de disponibilidade para vendedores, respeitando permissões de personalização e implementando fallback seguro para horários da organização.
  - Reordenamento estratégico da Sidebar (Dashboard > Empresa > Catálogo > ... > Perfil > Analytics).
  - Implementação do campo `specs_title` e layout de coluna única para especificações.
  - Substituição de botões estáticos por Sliders de Status (Visível/Estoque).
  - Auditoria completa de cores (Pre-Git Scan) removendo hexadecimais fixos e classes `zinc` residuais.

---
*Última atualização: 2026-06-19*

> [!IMPORTANT]
> Para acompanhar o progresso técnico e tarefas em aberto, consulte o arquivo [PENDENCIAS.md](file:///Users/macstudio-maj/Documents/PlataformaShop/PENDENCIAS.md).
