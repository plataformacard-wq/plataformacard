# Design System da PlataformaShop (Modelado sobre a ClickCard)

Este documento descreve a adaptação do Design System da ClickCard para a identidade visual oficial da **PlataformaShop**, servindo de guia para a refatoração e implementação da nossa landing page (`app/page.tsx`).

---

## 1. Paleta de Cores Adaptada (Color Palette)

Substituímos o esquema azul corporativo da ClickCard pelas cores oficiais e premium da PlataformaShop, focando na combinação de tons esmeralda (Emerald) e fundos profundos em Dark Mode.

### A. Cores de Fundo (Backgrounds)
*   **Fundo Principal (Light Mode):** Branco Puro (`#FFFFFF`) e Cinza Claro (`#F5F5F5`). Usado para blocos de leitura limpos, FAQs e tabelas administrativas.
*   **Fundo de Destaque / Dark Mode Base:** Chumbo/Carvão Profundo (`#23262D`) e Preto Base (`#0A0A0A`).
*   **Gradiente Radial de Fundo (Seções Especiais):** Fundo `#0A0A0A` com gradiente radial de destaque em `#0D3B1F` (Verde Floresta Escuro) para destacar mockups de smartphones com brilho.

### B. Cores de Destaque e Acento (Accent/Highlight)
*   **Verde Primário (Marca):** `#2CCB68` (Verde Esmeralda Vibrante / Emerald-500). Usado em logotipos, ícones de destaque, badges e botões de chamada para ação (CTA) principal.
*   **Verde Secundário (Hover):** `#23994A` (Verde Escuro para contraste e hovers).
*   **Gradients Premium:** Gradientes lineares de verde-esmeralda para ciano-menta (`linear-gradient(135deg, #2CCB68 0%, #06B6D4 100%)`) em elementos decorativos selecionados.

### C. Cores de Texto (Typography Colors)
*   **Em fundo claro:** Títulos em Preto Neutro (`#171717`) e corpo de texto em Cinza Escuro (`#737373`).
*   **Em fundo escuro:** Texto de destaque em Branco Puro (`#FFFFFF`) e detalhes secundários em Cinza Claro (`#9AA0A6` / `#A3A3A3`).

---

## 2. Tipografia (Typography)

Adotamos a combinação de fontes modernas e geométricas do nosso guia mestre de onboarding:

*   **Famílias de Fontes**:
    *   `Plus Jakarta Sans`: Usada exclusivamente para Títulos (H1, H2) e botões de chamada à ação. Traz robustez e apelo corporativo.
    *   `Inter`: Usada para corpo de texto (H3, parágrafos, spans) para garantir legibilidade perfeita, principalmente em celulares.
*   **Hierarquia Visual**:
    *   **H1 (Títulos Principais / Hero)**: Peso Extra-Bold (800) ou Bold (700), tamanhos de `36px` a `48px` (desktop) e `28px`-`32px` (mobile).
    *   **H2 e H3 (Títulos de Seções / Benefícios)**: Peso Semi-Bold (600), tamanhos de `24px` a `32px`.
    *   **Corpo de Texto (Body Text)**: Peso Regular (400), tamanho padrão de `16px` com `line-height` de `1.5` a `1.6`.
    *   **Textos de Botões/Rótulos**: Peso Semi-Bold (600), tamanhos de `14px` a `16px`.

---

## 3. Estilos de Componentes (Component Styles)

### A. Botões (Buttons)
*   **Primários (CTA principal)**: Cantos arredondados (border-radius de `12px`). Preenchimento sólido em Verde Primário (`#2CCB68`) com texto em branco. Efeito hover transicionando suavemente para o Verde Secundário (`#23994A`).
*   **Secundários/Outlines**: Fundo transparente, borda fina de `1.5px` em verde ou cinza claro, com texto combinando com a cor da borda.

### B. Campos de Entrada (Inputs)
*   Fundo do input em `#ffffff` (Light) ou `#1A1A1A` (Dark). Bordas finas (`#D4D4D4` / `#333333`). Cantos arredondados (`8px`). 
*   **Foco dinâmico**: Ao clicar, adiciona um contorno verde brilhante (`#2CCB68`) e um anel de sombra sutil.

### C. Cards de Demonstração (Simulador de Cartão)
*   **Glassmorphism (Efeito Translúcido)**: Cards sobre o fundo escuro usam fundo translúcido `rgba(20, 20, 20, 0.6)` ou `rgba(255, 255, 255, 0.05)` combinado com desfoque de fundo (`backdrop-filter: blur(10px)`) e bordas brancas semitransparentes extremamente finas (`rgba(255,255,255,0.1)`), dando o aspecto de "vidro fosco" sobreposto ao fundo escuro.
*   **Sombras (Drop Shadows)**: Sombras difusas e suaves (`box-shadow: 0 10px 30px rgba(0,0,0,0.06)`) para criar profundidade tridimensional, fazendo os cartões parecerem "flutuar" sobre a página.
*   **Bordas**: Cantos arredondados pronunciados (border-radius de `12px` a `16px`) simulando o corte do cartão físico NFC.

---

## 4. Layout e Estrutura (Layout & Grid)

*   **Paddings Verticais**: Margens entre seções de `80px` a `120px` no desktop para criar um layout com bastante "respiro", destacando o produto central.
*   **Grid e Colunas**:
    *   *Desktop*: Grade baseada em 12 colunas, com divisões de 2 colunas (50%/50% para Hero e seções de texto/imagem) e 3 colunas para a grade de diferenciais e planos.
    *   *Mobile*: Grid fluido de coluna única (100% de largura) com alinhamento centralizado para facilitar o toque em telas verticais.

---

## 5. Efeitos Visuais e Animações (Visual Effects & Animations)

*   **Efeitos de Hover (Passagem do Mouse)**:
    *   *Botões*: Transição suave de cor (`all 0.3s ease-in-out`), às vezes acompanhada por um leve deslocamento vertical de `2px` ou aumento de sombra para indicar clicabilidade.
    *   *Cards de Cartão*: Leve escala (`transform: scale(1.02)`) e aumento da sombra projetada para criar um efeito de "elevação física".
*   **Animações de Scroll**: Utilizaremos `framer-motion` para criar animações de surgimento (fade-in) e movimento de baixo para cima (slide-up) conforme o usuário rola a página.
