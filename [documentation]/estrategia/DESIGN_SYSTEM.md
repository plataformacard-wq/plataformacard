# Design System - PlataformaShop

Este documento registra os padrões visuais e trechos de código que formam a identidade "Premium / High-End" da PlataformaShop, inspirados no Dark Mode e Glassmorphism.

## Padrão de Fundo Global (Background Pattern)

Para manter a consistência visual em telas principais (Landing Page, Login, Cadastro), utilizamos uma combinação de **Fundo Gradeado (Grid)** + **Iluminação Radial Suave (Smooth Glow)**.

### 1. Fundo Gradeado (Grid Pattern)
Utilizamos um CSS grid sutil com quadrados de 40x40px (branco puro com 4% de opacidade) e uma máscara de desfoque radial para as bordas não ficarem duras.

```tsx
{/* Grid Pattern Background */}
<div 
  className="absolute inset-0 pointer-events-none" 
  style={{
    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)'
  }}
/>
```

### 2. Iluminação Radial Suave (Smooth Glow)
**Regra vital:** Nunca usar `blur-[150px]` do Tailwind para iluminação de fundo devido ao efeito de banding/pixelation em telas de alta resolução. O padrão correto é usar `radial-gradient` nativo do CSS para criar focos de luz Esmeralda (`#2CCB68`) e Ciano (`#06B6D4`).

```tsx
{/* Smooth Radial Glow Backgrounds */}
<div 
  className="absolute inset-0 pointer-events-none"
  style={{
    background: 'radial-gradient(circle at 25% 30%, rgba(44, 203, 104, 0.08) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)'
  }}
/>
```

> **Atenção:** Em seções como a Hero Section, a intensidade do verde pode ser aumentada ligeiramente (ex: de `0.08` para `0.15`) dependendo do contraste desejado com o restante da página.

## Cores Principais

- **Fundo Principal (Dark Mode):** `#0a0a0a` ou `zinc-950`
- **Cards e Painéis:** `#141414` ou `white/5` (Geralmente acompanhados de `backdrop-blur-md` e `border border-white/5`)
- **Cor Primária (Verde Esmeralda Corporativo):** `#2CCB68`
- **Cor Secundária (Ciano):** `#06B6D4`
- **Gradiente de Botões CTA:** `bg-gradient-to-r from-[#2CCB68] to-[#06B6D4]`

## Componentes Frequentes

- **Inputs Textuais:** Possuem fundo transparente ou `#0a0a0a`, borda `white/10` e, no hover/focus, acendem com `border-[#2CCB68]`. Ícones da biblioteca `lucide-react` devem ser integrados visualmente dentro da caixa do input.
- **Micro-interações:** Todos os elementos interativos devem possuir transições suaves de cor ou brilho. Usar `group` do Tailwind e `group-hover` para brilhos complexos (ex: botões ou cards de features).
