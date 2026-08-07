# 📖 PlataformaShop: Documentação Central (SSOT)

> **Fonte Única de Verdade (Single Source of Truth - SSOT)**  
> Este documento registra a arquitetura oficial, os padrões visuais, as convenções de métricas, a biblioteca de gráficos SVG nativos e os protocolos de desenvolvimento da PlataformaShop.

---

## 📌 Sumário
1. [Visão Geral & Tecnologias](#1-visão-geral--tecnologias)
2. [Padrão de Gráficos Nativos SVG (`DashboardKpiSparklines.tsx`)](#2-padrão-de-gráficos-nativos-svg-dashboardkpisparklinestsx)
3. [Convenção das Métricas de Estoque & Indicadores](#3-convenção-das-métricas-de-estoque--indicadores)
4. [Arquitetura de Modais Analíticos em 2 Colunas](#4-arquitetura-de-modais-analíticos-em-2-colunas)
5. [Sistema de Cores de Alto Contraste & Design System](#5-sistema-de-cores-de-alto-contraste--design-system)
6. [Persistência de Preferências (`localStorage`)](#6-persistência-de-preferências-localstorage)
7. [Protocolos de Desenvolvimento & Qualidade](#7-protocolos-de-desenvolvimento--qualidade)

---

## 1. Visão Geral & Tecnologias

A **PlataformaShop** é uma solução de e-commerce e gestão analítica multicanais integrada com Next.js 14 (App Router), Tailwind CSS, Supabase e Bling ERP.

### Princípios de UX/UI:
- **Dark/Light Mode Nativo:** Uso estrito das variáveis CSS do sistema (`var(--dash-surface)`, `var(--dash-bg)`, `var(--dash-text-primary)`).
- **Sem Placeholders Fictícios:** Gráficos e indicadores refletem dados empíricos do banco de dados e parâmetros do negócio.
- **Micro-animações de Alto Valor:** Transições fluidas com `framer-motion` em seletores e modais.

---

## 2. Padrão de Gráficos Nativos SVG (`DashboardKpiSparklines.tsx`)

Todos os cartões e modais analíticos compartilham uma arquitetura unificada de gráficos nativos em SVG ([components/dashboard/home/DashboardKpiSparklines.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/home/DashboardKpiSparklines.tsx)).

### Tipos de Gráficos Disponíveis:

| Ícone | Tipo | Componente | Descrição / Uso Recomendado |
| :---: | :--- | :--- | :--- |
| 📈 | **Onda (Área)** | `<AreaSparkline />` | Desenha uma curva orgânica fluida (Cubic Bezier Spline) com área gradiente. Exibe tooltip ao passar o mouse em cada parâmetro. |
| 📊 | **Barras** | `<BarSparkline />` | Exibe barras verticais com cantos arredondados. Suporta cores individuais por barra através da propriedade `color` em cada `SparklinePoint`. |
| 🍩 | **Donut** | `<DonutSparkline />` | Exibe a proporção relativa entre segmentos circulares coloridos de alto contraste. |

### Interface de Dados (`SparklinePoint`):
```typescript
export interface SparklinePoint {
  label: string;
  value: number;
  color?: string; // Cor individual opcional para a barra ou segmento
}
```

---

## 3. Convenção das Métricas de Estoque & Indicadores

Para evitar ambiguidades analíticas, o sistema diferencia estritamente **Volumetria Física** de **Catálogo de SKUs**:

### A. Distinção de Grandezas:
- **Peças Físicas / Unidades:** Somatório exato de itens físicos armazenados no estoque (ex: 548 peças).
- **Modelos / SKUs de Produtos:** Contagem de cadastros de produtos individuais (ex: 18 SKUs registrados).

### B. Mapeamento dos 4 Parâmetros do Estoque Global:
1. 🟦 **Peças Disponíveis (`#3b82f6`):** Soma das unidades estocadas dos produtos com estoque $> 0$.
2. 🟨 **Peças Zeradas (`#f59e0b`):** Soma das unidades dos produtos com estoque zerado ($0$ un).
3. 🟩 **Modelos Ativos (`#10b981`):** Contagem de SKUs com estoque disponível.
4. 🟥 **Modelos Zerados (`#ef4444`):** Contagem de SKUs com estoque esgotado.

### C. Agrupamento Comercial por Categoria:
Nos modais e cartões de **Esgotados** e **Volumetria**, os produtos são agrupados por **Setor / Categoria**, permitindo identificar qual departamento da loja sofre maior impacto por rupturas.

---

## 4. Arquitetura de Modais Analíticos em 2 Colunas

Todos os modais detalhados de métricas (`GlobalStockModal`, `LowStockAlertModal`, `OutOfStockModal`, `TopCategoriesModal`) utilizam o padrão **Grid 2 Colunas (12 colunas)**:

```
+-------------------------------------------------------------------------------+
| HEADER DO MODAL (Título, Subtítulo e Botão Fechar)                           |
+------------------------------------+------------------------------------------+
| COLUNA 1 (lg:col-span-5)           | COLUNA 2 (lg:col-span-7)                 |
| - Seletor de Gráfico (Onda/Barras/ | - Filtro e Campo de Busca (SKU/Nome)     |
|   Donut)                           | - Lista com Scroller Responsivo          |
| - Card de Gráfico Interativo SVG   | - Botões de Ação Inline (+1, +5, +10,    |
| - Legenda com Alto Contraste       |   Ajustar Estoque Direto)                |
| - Cards de Métricas Diagnósticas   |                                          |
+------------------------------------+------------------------------------------+
```

---

## 5. Sistema de Cores de Alto Contraste & Design System

Para garantir máxima acessibilidade tanto no modo Claro quanto Escuro, os gráficos e badges utilizam a seguinte paleta de cores de alto contraste:

### Paleta de Métricas do Inventário:
- 🟦 **Azul Royal (`#3b82f6`):** Peças Disponíveis / Volumetria de Unidades.
- 🟨 **Âmbar Ouro (`#f59e0b`):** Peças Zeradas / Alertas de Reposição Baixa.
- 🟩 **Verde Esmeralda (`#10b981`):** Modelos Ativos / Status OK / 100% Disponível.
- 🟥 **Vermelho Rose (`#ef4444`):** Modelos Zerados / Produtos Esgotados / Vendas Bloqueadas.

### Paleta Vibrante de Categorias (6 Tons Distintos):
- 🟣 `Category 1`: **Violete Intenso** (`#7c3aed`)
- 🔷 `Category 2`: **Ciano / Teal Vibrante** (`#06b6d4`)
- 🟩 `Category 3`: **Verde Esmeralda** (`#10b981`)
- 🟨 `Category 4`: **Âmbar Ouro** (`#f59e0b`)
- 🌸 `Category 5`: **Rosa Magenta** (`#ec4899`)
- 🟦 `Category 6`: **Azul Royal** (`#3b82f6`)

---

## 6. Persistência de Preferências (`localStorage`)

Para garantir que a visualização escolhida pelo usuário (Onda 📈, Barras 📊 ou Donut 🍩) seja mantida durante a navegação, as preferências são salvas localmente:

- **Chave LocalStorage:** `dash_estoque_chart_types`
- **Mapeamento de Estados:**
```typescript
const [chartTypes, setChartTypes] = useState<Record<string, "area" | "bar" | "donut">>({
  estoque_total: "area",
  estoque_baixo: "bar",
  estoque_esgotado: "area",
  estoque_categorias: "donut",
});
```

---

## 7. Protocolos de Desenvolvimento & Qualidade

### A. Protocolo VPGP (Verify, Push, Github, Push):
1. **Validar (Build):** Executar `npx tsc --noEmit` localmente para garantir 0 erros de tipagem.
2. **Commit:** Staging (`git add .`) e commit explicativo (`git commit -m "..."`).
3. **Push:** Enviar alterações para a branch remota (`git push`).

### B. Regra de Padding para Dropdowns (`.dash-select`):
Ao utilizar elementos `<select>`, utilize obrigatoriamente a classe `.dash-select` com `pl-3` / `pl-2` e `pr-7` / `pr-10` para evitar sobreposição do ícone de seta do navegador.

### C. Auditoria Anti-Monolito (PRM):
Nenhum arquivo de componente deve ultrapassar 500 linhas de código. Componentes pesados devem ser divididos em sub-componentes modulares.

### D. Motor de Busca Inteligente (`smartSearchMatch`):
Todos os campos de pesquisa (Estoque, Modais, Catálogo Público e Header) utilizam a biblioteca de alinhamento semântico `lib/utils/smart-search.ts`.

- **Mapeamento Semântico:**
  - `[esgotado]`, `sem estoque`, `zerado`, `indisponivel` $\rightarrow$ Filtra produtos com estoque $= 0$ ou `is_in_stock = false`.
  - `baixo`, `reposição`, `crítico` $\rightarrow$ Filtra produtos com unidades $1 \le \text{qtd} \le 5$.
  - `disponivel`, `em estoque`, `pronta entrega` $\rightarrow$ Filtra produtos ativos com estoque $> 0$.
  - `promocao`, `desconto`, `oferta` $\rightarrow$ Filtra produtos com preço promocional ativo.
  - Ignora colchetes e caracteres especiais (ex: `[esgotado]` $= $ `esgotado`).

---
*Documentação atualizada e mantida em sincronia com o repositório PlataformaShop.*
