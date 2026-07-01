# Landing Page Premium: PlataformaShop

O objetivo deste plano é refatorar a página inicial atual (`app/page.tsx`) para alinhá-la à nova fase de estruturação e ao domínio oficial `plataformashop.com.br`. Vamos substituir os estilos inline antigos por um design de alto nível (Premium), utilizando Tailwind CSS, Framer Motion e a estética de Glassmorphism.

## Open Questions / Pendências para Definição

Para que o design fique perfeito para o seu negócio, é preciso alinhar três pontos antes do início do desenvolvimento:

1. **Cores da Marca:** Atualmente, a cor de destaque é um verde padrão (`#2CCB68`). Para o *PlataformaShop*, devemos manter um Verde Premium (ex: Emerald/Teal brilhante) ou mudar para outra cor primária em mente (ex: Roxo, Azul, etc.)?
2. **Público-Alvo Principal da Copy:** A chamada principal do site deve atrair mais as **Distribuidoras/Franquias** (focando em controle de rede) ou os **Lojistas Independentes/Vendedores** (focando em ter o primeiro catálogo)?
3. **Imagens/Mockups:** Gerar algumas imagens de vitrines de lojas via IA, ou deixar espaços vazios sofisticados para colocar prints reais do sistema depois?

## Proposed Changes (Escopo Técnico)

### Componente Principal (Landing Page)
Será feita uma reescrita completa utilizando Tailwind e animações fluídas.

- **Hero Section (Topo):**
  - Remoção de CSS inline.
  - Adição de `Framer Motion` para animações de entrada (Fade-in e Slide-up).
  - Background radial com gradiente dinâmico e sutil.
  - Título principal impactante com tipografia moderna (Plus Jakarta Sans) focada na marca *PlataformaShop*.
- **Social Proof / Dores:**
  - Layout em *Bento Grid* (cards assimétricos modernos) com efeito de *Glassmorphism* (fundo translúcido com blur).
- **Features (Vantagens):**
  - Blocos alternados com micro-animações no hover, enfatizando a "Sincronização em Tempo Real" e a "Vitrine Individual".
- **Planos (Pricing):**
  - Redesign do card "Start (Grátis)" e do card "Enterprise (Franquias)".
  - Botões de CTA (Call to Action) com efeitos de brilho e pulso para maximizar conversão.
- **Header & Footer:**
  - Header fixo com efeito "glass" ao rolar a página.
  - Link de "Fazer Login" e botão de destaque para "Criar Conta".
