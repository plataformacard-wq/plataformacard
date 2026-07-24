# Manual do Design System — Landing Page (PlataformaShop)

Este documento estabelece as especificações oficiais de UI/UX, paletas de cores, componentes e diretrizes visuais da Landing Page da **PlataformaShop**, protegendo a estética premium no **Tema Escuro (Dark Mode Baseline)** e definindo os tokens para o **Tema Claro (Light Mode)**.

---

## 🖤 Tema Escuro (Dark Mode Baseline — Padrão Oficial)

O Tema Escuro é a identidade visual de referência da PlataformaShop, projetado para transmitir inovação, exclusividade, tecnologia e alto valor percebido (Apple / Stripe Style).

### 🎨 Paleta de Cores Oficiais (Dark Mode)

| Token | Cor / Hex | Aplicação / Utilização |
| :--- | :--- | :--- |
| **Canvas Principal** | `#0a0a0a` | Fundo oficial da página inteira. |
| **Fundo de Cards / Superfície** | `#121214` ou `rgba(255,255,255,0.05)` | Fundo com efeito glassmorphism e transparência. |
| **Bordas de Cards** | `rgba(255,255,255,0.1)` | Linhas de divisão e contornos de cards. |
| **Destaque Primário (Emerald)** | `#2CCB68` / `#10b981` | Botões de conversão, ícones de check, badges e detalhes atômicos. |
| **Desconto & Alerta (Amber)** | `#FFB800` | Stickers de desconto (*R$ XX OFF/mês*) e elementos de urgência. |
| **Texto Título Principal** | `#FFFFFF` | Títulos `<h1>`, `<h2>`, `<h3>` de alto impacto. |
| **Texto Secundário / Corpo** | `#A1A1AA` (`zinc-400`) / `#D4D4D8` (`zinc-300`) | Subtítulos, descrições de recursos e características. |
| **Gradiente do Fundo** | `radial-gradient(circle at 15% 50%, rgba(44,203,104,0.08), transparent 50%)` | Iluminação ambiente verde/ciano ao fundo. |

---

## ☀️ Tema Claro (Light Mode)

O Tema Claro oferece uma alternativa ultra-clean para lojistas e ambientes com alta luminosidade externa.

### 🎨 Paleta de Cores (Light Mode)

| Token | Cor / Hex | Aplicação / Utilização |
| :--- | :--- | :--- |
| **Canvas Principal** | `#FAFAFA` / `#F4F4F5` | Fundo limpo e suave. |
| **Fundo de Cards** | `#FFFFFF` | Cards em container branco solido com sombra suave. |
| **Sombra de Cards** | `0 10px 30px -10px rgba(0,0,0,0.08)` | Elevação e profundidade dos cards. |
| **Bordas de Cards** | `#E4E4E7` (`zinc-200`) | Divisões claras de alta definição. |
| **Texto Título Principal** | `#09090B` (`zinc-950`) | Títulos em preto fosco corporativo. |
| **Texto Secundário** | `#52525B` (`zinc-600`) | Subtítulos e parágrafos. |

---

## 🧩 Componentes Chave da Landing Page

### 1. Header (Menu Superior)
- **Fundo**: Translúcido com `backdrop-blur-md` (`bg-[#0a0a0a]/80` no escuro / `bg-white/80` no claro).
- **Logo**: Versão branca oficial em fundo escuro (`/logo_fundo_escuro_ps.png`) e versão adaptada no claro.
- **ThemeToggle**: Botão seletor de tema ☀️/🌙 persistente via `localStorage`.

### 2. Hero Section
- **Headline `<h1>`**: Font `Plus_Jakarta_Sans` extra-bold em tom de destaque (Branco puro `#FFFFFF` no escuro / `#09090B` no claro).
- **CTA Principal**: Botão em verde vibrante `#2CCB68` com efeito hover de elevação e sombra de neon verde.

### 3. Pricing Cards (Tabela de 4 Colunas)
- **Disposição**: 4 colunas em 1 linha contínua no desktop (`STARTER`, `PRO`, `PREMIUM`, `FRANQUEADOR`).
- **Alinhamento Vertical Y**: Slots de altura fixa para Badge, Preço Riscado, Preço Principal e Subtexto de Economia, garantindo alinhamento horizontal impecável.
- **Card Recomendado (PRO)**: Borda verde `#2CCB68` em destaque com badge superior verde.

### 4. Matriz Comparativa (PlanComparisonTable)
- **Comportamento**: Sanfona expansível (*accordion*) com animação `Framer Motion`.
- **Preços e Validações**: Totalmente reativos ao toggle de ciclo (Mensal/Anual) e sincronizados com `lib/plans/feature-matrix.ts`.

---

## 🛡️ Regras Invioláveis de Manutenção

1. **Dark Mode como Padrão Baseline**: A Landing Page **SEMPRE** inicia por padrão em Dark Mode (`#0a0a0a`), preservando o contraste e o apelo estético original.
2. **Sem Texto Fantasma**: Qualquer modificação em classes do Tailwind **DEVE** conter explicitamente o prefixo `dark:` acompanhado da cor de modo claro correspondente (ex: `text-zinc-900 dark:text-white`), impedindo textos brancos em fundos claros ou pretos em fundos escuros.
3. **Preservação de Fontes**: Utilizar estritamente as fontes oficiais `Plus_Jakarta_Sans` (Títulos e Preços) e `Inter` (Corpo e Navegação).
