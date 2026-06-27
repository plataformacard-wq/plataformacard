# Landing Page Onboard (Mapa de Construção)

Este documento serve como o **Guia Mestre (Blueprint)** e Fonte Única de Verdade (SSOT) para a estratégia, design e arquitetura de conversão da Landing Page da PlataformaShop. 

Ele deve ser utilizado como referência para qualquer futura manutenção de código, expansão de copywriting ou contratação de tráfego pago (Ads).

---

## 1. Posicionamento Estratégico (O "Core")
A página não vende um "simples link na bio". Ela vende uma **solução de tecnologia corporativa** (CaaS - Catalog as a Service). 

**Pilar Principal (Autoridade):** Posicionar o produto como nível *Enterprise* para fisgar o decisor B2B (Dono de Distribuidora, Gestor de Franquias), gerando um contraste de altíssimo valor percebido quando o vendedor autônomo (B2C) descobrir que existe um plano inicial gratuito.

### Os Dois Funis Simultâneos:
1. **O Funil B2B (Primário / High-Ticket):** 
   - **Alvo:** Diretores e Donos de Negócios.
   - **Comportamento:** Eles leem o topo da página, sentem a autoridade corporativa e não querem "fuçar" no sistema sozinhos. 
   - **Ação:** Clicar em "Falar com Especialista" ou "Agendar Demonstração" -> Redirecionamento para o WhatsApp do Fundador para fechamento manual.

2. **O Funil B2C (Secundário / Product-Led Growth):** 
   - **Alvo:** Vendedor autônomo, Representante individual.
   - **Comportamento:** Eles descem a página impactados pela tecnologia e se deparam com a Tabela de Preços, descobrindo o Plano Start.
   - **Ação:** Clicar em "Criar Conta Grátis" -> Redirecionamento para o onboarding nativo (Self-Service).

---

## 2. Identidade Visual (Design System Premium)
Baseado no *Brand Book*, a página transmite uma "vibe" de SaaS/Fintech moderna, abandonando o visual tradicional de varejo.

- **Tema:** Dark Mode Absoluto (Glassmorphism sutil).
- **Cores Principais:**
  - Background Base: `#23262D` (Chumbo/Carvão profundo - Nunca preto puro).
  - Acento Primário: `#2CCB68` (Verde "PlataformaShop", dita o ritmo dos cliques).
  - Acento Secundário: `#23994A` (Verde escuro para profundidade e hovers).
  - Textos: `#FFFFFF` (Títulos) e `#9AA0A6` (Corpo de texto - Cinza elegante).
- **Tipografia:**
  - `Plus Jakarta Sans`: Exclusiva para Títulos (H1, H2) e Botões Primários (traz robustez e modernidade).
  - `Inter`: Corpo de texto (H3, p, spans) garantindo legibilidade perfeita.
- **Elementos Visuais:** Pattern de "Circuitos e Conexões" de forma bem sutil no fundo da primeira dobra.

---

## 3. Arquitetura da Página (Bloco a Bloco)

### Bloco 1: Header (Navegação)
- **Objetivo:** Credibilidade instantânea e rotas de fuga estratégicas.
- **Elementos:** Logo (PlataformaShop) à esquerda. Dois botões à direita: "Fazer Login" (Texto sutil) e "Falar com Especialista" (Botão Verde Chamativo). O Header afunila a atenção para a conversão B2B.

### Bloco 2: Hero Section (A Primeira Impressão)
- **Objetivo:** Reter a atenção nos primeiros 3 segundos batendo na maior dor do B2B.
- **Micro-copy (Tag):** SOLUÇÃO CAAS (CATALOG AS A SERVICE).
- **Headline (H1):** "O fim do caos em PDFs. Retome o controle absoluto das suas vendas."
- **Sub-Headline:** Explicação lógica e direta ("Centralize seus produtos, atualize preços em tempo real para toda a rede... e receba pedidos no WhatsApp").
- **Ação Principal:** Botão gigante "Agendar Demonstração B2B" (Efeito hover invertendo as cores).

### Bloco 3: Agitação da Dor (Pain Points)
- **Objetivo:** Fazer o cliente concordar com o problema antes de você vender a solução.
- **Cards (Grid):**
  1. *Preços Desatualizados:* O risco do vendedor vender mais barato porque não baixou o PDF.
  2. *Catálogos Amadores:* O impacto negativo na marca.
  3. *Falta de Métricas:* O PDF como uma "caixa preta" sem dados de engajamento.

### Bloco 4: Funcionalidades Premium (A Solução)
- **Objetivo:** Mostrar como a PlataformaShop cura a dor de forma mágica.
- **Layout:** Z-Pattern (Ziguezague de Texto/Imagem).
- **Tópicos de Venda:**
  - **Catálogo Mestre:** Atualizou no painel, atualizou na rua.
  - **Vitrine Blindada:** O vendedor ganha o link com o nome dele, mas a empresa mantém as rédeas do que é ofertado.
  - **Negociação no WhatsApp:** Como gerar fluxo para fechamento humano em vez de um carrinho de compras abandonado.

### Bloco 5: A Ponte B2C (O Gancho de Preços)
- **Objetivo:** Acolher o "Pequeno peixe" que chegou na página e mostrar que ele também pode usar.
- **Headline da Seção:** "Planos desenhados para o seu tamanho. Você não precisa ser gigante para usar tecnologia."
- **Tabela de Preços (Dual Card):**
  - **Card Esquerdo (Start):** Grande destaque para o texto "Grátis". Focado no indivíduo (limite de 20 produtos). Botão outline chamando para o Self-Service (`/cadastro`).
  - **Card Direito (Enterprise):** Destaque verde maciço com tag "Recomendado para Empresas". Customizado, foco no gestor. Botão chamando para o WhatsApp do Especialista.

---

## 4. Gatilhos Mentais Utilizados no Copy
1. **Inimigo Comum:** O "PDF" tradicional é tratado como o vilão arcaico que trava as vendas.
2. **Autoridade (Efeito Halo):** O uso rigoroso de termos em inglês do mercado tech (`CaaS`, `Enterprise`) e a estética Dark Mode associam a ferramenta instantaneamente a gigantes do Vale do Silício.
3. **Ancoragem de Preço:** Ao vender uma solução "Customizada para Corporações", o cliente pequeno imediatamente entende que a ferramenta vale milhares de reais. Quando ele vê que o uso básico é gratuito, o "Deal" (negócio) parece irrecusável.

---
*Este documento reflete a engenharia do `app/page.tsx` gerada na Sprint de Estratégia de Captação.*
