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

## 5. Prevenção de Regressões (Protocolo de Resiliência)
- **Suspense Boundaries:** Obrigatório o uso de `Suspense` em componentes que utilizam `useSearchParams` ou dados dinâmicos de BI (ex: Analytics).
- **Hooks Management:** Nunca chamar hooks (`useState`, `useEffect`) dentro de condicionais ou após retornos antecipados. Centralizar todos no topo do componente.
- **Tokenização:** Proibido o uso de cores hexadecimais fixas no JSX. Sempre usar tokens CSS (`var(--dash-...)`).

## 6. Arquitetura Modular (Refatoração)
- **Extração de Modais:** Componentes complexos (ex: `ProductModal`, `CategoryModal`) devem ser extraídos para arquivos dedicados em `components/dashboard/`.
- **Comunicação via Props:** A comunicação deve ocorrer estritamente via props (`isOpen`, `onClose`, `onSuccess`), mantendo o componente pai (`CatalogoClient`) como orquestrador de dados.
- **Persistência de Rascunhos:** Formulários complexos devem utilizar `localStorage` para persistir rascunhos de descrições e especificações, evitando perda de dados em caso de refresh acidental.
- **Separação de Preocupações:** O cliente principal foca na listagem e filtros; os modais focam no CRUD e interações específicas (IA, Uploads).


## 7. Log de Alterações (Últimas Entregas)
- **2026-05-09:**
  - Estabilização definitiva do Dark Mode no `ProductModal` e `CategoryModal`.
  - Reordenamento estratégico da Sidebar (Dashboard > Empresa > Catálogo > ... > Perfil > Analytics).
  - Implementação do campo `specs_title` e layout de coluna única para especificações.
  - Substituição de botões estáticos por Sliders de Status (Visível/Estoque).
  - Auditoria completa de cores (Pre-Git Scan) removendo hexadecimais fixos e classes `zinc` residuais.

---
*Última atualização: 2026-05-09*
