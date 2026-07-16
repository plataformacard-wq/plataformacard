# Protocolo de Desenvolvimento UX / UI (PlataformaShop)

Este documento estabelece as regras estritas de interface (UI) e experiência do usuário (UX) que o Agente de IA e os desenvolvedores devem seguir OBRIGATORIAMENTE ao criar ou modificar páginas, modais e componentes dentro da aplicação. 

O objetivo é evitar quebras de layout (como textos invisíveis no modo claro/escuro) e garantir a consistência de um design de alto padrão (Premium/SaaS).

---

## 01. Regras de CSS para Tema Claro/Escuro (Dark Mode)
**NUNCA utilize cores fixas do Tailwind para estrutura (ex: `bg-white`, `bg-black`, `text-black`, `text-white`)**. Isso quebra a inversão automática do tema.

* **Fundo de Telas e Painéis Principais:** Utilize `bg-[var(--dash-bg)]`.
* **Fundo de Cards, Modais e Caixas:** Utilize `bg-[var(--dash-surface)]` ou `bg-[var(--dash-surface-secondary)]`.
* **Texto Principal (Títulos, Textos de Leitura):** Utilize `text-[var(--dash-text-primary)]`.
* **Texto Secundário (Descrições, Labels):** Utilize `text-[var(--dash-text-secondary)]` ou `text-[var(--dash-text-muted)]`.
* **Bordas (Dividers, Contornos de Cards):** Utilize `border-[var(--dash-border)]`.

*Exceção:* Cores de destaque absolutas (ex: botões vermelhos para exclusão ou verde/primary para chamadas de ação) podem usar classes do Tailwind, desde que testadas com a variante `dark:` (ex: `text-red-500 dark:text-red-400`).

---

## 02. Feedback Visual e Interações (Micro-interações)
* **Ações de Demora (Salvando, Carregando):** Todo botão de submissão de formulário ou ação de API DEVE obrigatoriamente mudar seu estado para desabilitado (`disabled={true}`) e exibir um spinner/loader (ex: `<Loader2 className="animate-spin" />` do Lucide-React).
* **Feedback de Hover:** Todos os botões clicáveis devem ter transição de hover (ex: `transition-colors hover:bg-primary/90`) para mostrar que são interativos.
* **Alertas de Erro:** Exibir mensagens de erro sempre em caixas com contraste (fundo avermelhado leve) acompanhadas de um ícone de alerta (ex: `AlertTriangle`), nunca usar texto vermelho solto na tela.

---

## 03. Glassmorphism e Efeitos Premium
Para dar o aspecto de software avançado, elementos flutuantes (como Headers fixos ou modais sobrepostos) devem usar o efeito de vidro (Glassmorphism).
* Utilize a classe utilitária local `glass` (definida no globals.css) ou a combinação de Tailwind: `bg-white/70 dark:bg-black/70 backdrop-blur-xl`.

---

## 04. Responsividade e Layout (Mobile-First)
* As páginas do dashboard não devem usar larguras fixas em pixels (`w-[500px]`). Utilize porcentagens ou flex/grid (`w-full`, `max-w-3xl`, `grid-cols-1 md:grid-cols-2`).
* Textos de botões devem ser curtos ou adaptar-se bem. Formulários devem empilhar (coluna) no mobile e ficar lado a lado em desktops.

---

## 05. Regras de Arredondamento de Cantos (Border Radius)
Seguindo o design system já estabelecido e aprovado para o aplicativo (Padrão Apple/Premium):

* **Cards Grandes, Painéis, Modais e Blocos de Destaque:** Devem utilizar obrigatoriamente cantos bem arredondados: `rounded-2xl` (ou `rounded-[27px]`).
* **Botões Principais, Inputs de Texto, Selects e Caixas Menores:** Devem utilizar obrigatoriamente `rounded-lg`.
* **Badges, Tags e Stickers:** Devem utilizar obrigatoriamente `rounded` (arredondamento leve, padrão de 4px). NUNCA utilize `rounded-full` (pílula) para stickers.
* **NUNCA** utilize cantos quadrados (`rounded-none`) ou arredondamentos ríspidos (`rounded-sm`) em componentes modernos da aplicação, exceto em stickers que usam `rounded`.
