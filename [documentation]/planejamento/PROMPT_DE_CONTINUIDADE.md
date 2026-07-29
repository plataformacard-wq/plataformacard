# 🟩 PROMPT DE CONTINUIDADE: Carrossel Duplo de Hero Mockups, Correção de Hidratação & Refatoração Anti-Monolito

**Data:** 29/07/2026

---

## 📌 Contexto da Sessão Concluída

Nesta sessão, realizamos a refatoração arquitetural do CMS do Hero, a solução de hidratação do React 19 / Next.js 16, a implementação do Carrossel Duplo de Hero Mockups e a auditoria completa de todos os carrosséis do sistema:

1. **Carrossel Duplo de Hero Mockups (Modo Escuro & Modo Claro):**
   - **Gerenciador de Galeria no Painel ([HeroMockupsSection.tsx](file:///c:/Users/Start/PlataformaShop/app/main/landing-page/hero/components/HeroMockupsSection.tsx)):** Upload de múltiplos mockups por tema com thumbnails numeradas (`#1`, `#2`, `#3`), exclusão individual com lixeira, auto-publicação e seletor de tempo de rotação (**3s, 4s, 5s, 6s, 8s**).
   - **Animação & UX na Landing Page ([HeroSection.tsx](file:///c:/Users/Start/PlataformaShop/components/HeroSection.tsx)):** Transição suave *Cross-Fade* via `framer-motion`, pausa ao passar o mouse (*Pause on Hover*), indicadores por bolinhas (*dots*), preenchimento total da caixa (`object-cover`) e **Fallback Inteligente Completo** (0 fotos -> padrão, 1 foto -> estático, 2+ fotos -> rotação animada e fallback cruzado entre temas).
   - **Banco de Dados & Schema ([20260729000000_add_hero_mockups_carousel_columns.sql](file:///c:/Users/Start/PlataformaShop/supabase/migrations/20260729000000_add_hero_mockups_carousel_columns.sql)):** Adicionadas as colunas `hero_mockups_dark` (jsonb), `hero_mockups_light` (jsonb) e `hero_carousel_interval` (integer) com validação em `cms-schemas.ts`.

2. **Solução do Erro de Hidratação (React 19 / Next.js 16):**
   - Reposicionadas as tags `<script type="application/ld+json">` para fora da tag `<main>` usando React Fragment `<>` em [app/page.tsx](file:///c:/Users/Start/PlataformaShop/app/page.tsx).
   - Eliminado o erro de divergência de contagem de nós filhos entre o SSR do servidor e a hidratação no cliente.

3. **Refatoração Anti-Monolito ([HeroClient.tsx](file:///c:/Users/Start/PlataformaShop/app/main/landing-page/hero/HeroClient.tsx)):**
   - Arquivo monolítico reduzido de **510 linhas** para **195 linhas**, extraindo a interface para sub-componentes modulares: `HeaderLogosSection`, `HeroMockupsSection` e `HeroTextsSection`.

4. **Auditoria nos Sistemas de Carrosséis:**
   - **Carrossel 1 (Hero Mockups):** Animação Framer Motion *Cross-Fade*, suporte dual theme, pause-on-hover e fallback inteligente.
   - **Carrossel 2 (Depoimentos - `Testimonials.tsx`):** Marquee vertical de 3 colunas com desfoque `mask-image` no topo e base e pausa ao passar o cursor.
   - **Carrossel 3 (Empresas Parceiras - `CompanyLogos.tsx`):** Marquee horizontal infinito com faders de gradiente lateral e controle condicional para 6+ parceiros.

5. **Protocolo VPGP & Qualidade de Código:**
   - Varredura de UX/UI com 241 correções aplicadas.
   - Compilação TypeScript `npx tsc --noEmit` validada com 0 erros.

---

## 🔗 Links para Testes (`http://localhost:3000`):
- **Landing Page (Carrossel Hero & SEO):** http://localhost:3000
- **CMS Admin (Gerenciador de Galeria e Tempo do Carrossel):** http://localhost:3000/main/landing-page/hero
- **Dashboard Mobile:** http://localhost:3000/dashboard
- **Walkthrough da Sessão:** [walkthrough.md](file:///C:/Users/Start/.gemini/antigravity-ide/brain/9a1cb6fa-43a7-4665-9c1b-d1dfa7ccc775/walkthrough.md)

---

## 📋 PROMPT PARA COPIAR E COLAR NA PRÓXIMA SESSÃO:

```markdown
<CONTEXTO_DE_CONTINUIDADE>
Finalizamos a implementação do Carrossel Duplo de Hero Mockups (Modo Escuro & Claro), a solução de hidratação do React 19 / Next.js 16, a refatoração Anti-Monolito do HeroClient e a auditoria completa de todos os sistemas de carrossel da PlataformaShop.

*Resumo das Entregas Ativas:*
1. **Carrossel Duplo de Hero Mockups (Tema Escuro & Tema Claro):**
   - Galerias dinâmicas no CMS Admin (`hero_mockups_dark` e `hero_mockups_light`) com upload múltiplo, remoção individual e controle de tempo de rotação (3s, 4s, 5s, 6s, 8s).
   - Componente `HeroSection.tsx` com `framer-motion`, transição Cross-Fade suave, pause-on-hover, indicadores por dots, preenchimento total `object-cover` e Fallback Inteligente Completo.
2. **Solução do Mismatch de Hidratação:**
   - Tags de JSON-LD movidas para fora de `<main>` em `app/page.tsx` usando Fragment `<>`, zerando warnings e erros de hidratação no Next.js 16 / Turbopack.
3. **Refatoração Anti-Monolito:**
   - `HeroClient.tsx` modulado e limpo em sub-componentes (`HeaderLogosSection`, `HeroMockupsSection`, `HeroTextsSection`).
4. **Auditoria dos Carrosséis Concluída:**
   - Auditados `HeroSection.tsx`, `Testimonials.tsx` e `CompanyLogos.tsx` com 100% de conformidade técnica e visual.
5. **VPGP & Build:**
   - Compilação TypeScript `npx tsc --noEmit` validada com 0 erros.

*Objetivo da Nova Sessão:*
Executar o Protocolo Start, dar sequência às integrações comerciais e avançar nos testes de produção/deploy.
</CONTEXTO_DE_CONTINUIDADE>
```
