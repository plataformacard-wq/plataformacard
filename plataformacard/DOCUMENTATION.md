# PlataformaCard - Protocolo de Estabilização B2C (Essential)

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

## 6. Prevenção de Regressões (Protocolo de Resiliência)
- **Suspense Boundaries:** Obrigatório o uso de `Suspense` em componentes que utilizam `useSearchParams` ou dados dinâmicos de BI (ex: Analytics).
- **Hooks Management:** Nunca chamar hooks (`useState`, `useEffect`) dentro de condicionais ou após retornos antecipados. Centralizar todos no topo do componente.
- **Tokenização:** Proibido o uso de cores hexadecimais fixas no JSX. Sempre usar tokens CSS (`var(--dash-...)`).

## 7. Arquitetura Modular (Refatoração)
- **Extração de Modais:** Componentes complexos (ex: `ProductModal`, `CategoryModal`) devem ser extraídos para arquivos dedicados em `components/dashboard/`.
- **Comunicação via Props:** A comunicação deve ocorrer estritamente via props (`isOpen`, `onClose`, `onSuccess`), mantendo o componente pai (`CatalogoClient`) como orquestrador de dados.
- **Persistência de Rascunhos:** Formulários complexos devem utilizar `localStorage` para persistir rascunhos de descrições e especificações, evitando perda de dados em caso de refresh acidental.
- **Separação de Preocupações:** O cliente principal foca na listagem e filtros; os modais focam no CRUD e interações específicas (IA, Uploads).


## 9. Gestão de Recursos e Escalabilidade (Plano Free)
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

## 10. Log de Alterações (Últimas Entregas)
- **2026-05-09:**
  - **UI/UX Premium (Galeria):** Implementação de reordenação por drag-and-drop e novo fluxo de editor que abre antes do seletor de arquivos.
  - **Herança de Horários:** Correção da lógica de disponibilidade para vendedores, respeitando permissões de personalização e implementando fallback seguro para horários da organização.
  - Reordenamento estratégico da Sidebar (Dashboard > Empresa > Catálogo > ... > Perfil > Analytics).
  - Implementação do campo `specs_title` e layout de coluna única para especificações.
  - Substituição de botões estáticos por Sliders de Status (Visível/Estoque).
  - Auditoria completa de cores (Pre-Git Scan) removendo hexadecimais fixos e classes `zinc` residuais.

---
*Última atualização: 2026-05-10*

> [!IMPORTANT]
> Para acompanhar o progresso técnico e tarefas em aberto, consulte o arquivo [PENDENCIAS.md](file:///c:/Users/Start/plataformacard/PENDENCIAS.md).
