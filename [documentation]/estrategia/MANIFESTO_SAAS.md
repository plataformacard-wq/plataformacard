# 📄 Manifesto PlataformaShop: O Fim do Caos em PDFs

Este documento estabelece a visão central, o posicionamento estratégico, as premissas de negócio e os pilares arquiteturais do **PlataformaShop** (também denominado *PlataformaCard*). Ele serve como o guia filosófico e técnico que direciona o desenvolvimento da plataforma, assegurando que cada decisão de engenharia apoie o sucesso comercial do SaaS.

---

## 1. A Visão & O Propósito
O PlataformaShop nasce para resolver uma das dores mais persistentes do comércio social e corporativo: **o caos dos catálogos em arquivos PDF estáticos e tabelas descentralizadas**. 

Enviar um PDF estático para um cliente significa:
*   Perder a capacidade de atualizar preços em tempo real.
*   Frustrar o cliente com produtos que já estão fora de estoque.
*   Perder o rastreio de dados e analytics sobre o interesse dos compradores.
*   Gerar atrito na finalização do pedido, que exige redigitar códigos e dados de entrega no WhatsApp.

**Nossa Missão:** Dar o controle absoluto das vendas de volta ao lojista, transformando catálogos de produtos em canais interativos de alto desempenho, integrados com o mundo físico via NFC e conectados diretamente ao ecossistema de vendas do WhatsApp, com custo transacional zero.

---

## 2. Personas e Posicionamento de Mercado
O PlataformaShop adota um posicionamento híbrido único no mercado de vendas sociais e corporativas, atendendo a duas frentes distintas, mas integradas sob a mesma base técnica:

### A) Lojistas e Investidores de Alta Renda (Foco B2B - Maj Mobilidade Elétrica)
*   **A Persona:** Empresários e franqueados da rede de mobilidade elétrica (scooters, patinetes e acessórios).
*   **O Contexto:** Operações de alto valor (investimento inicial em estoque na casa de R$ 20k a R$ 30k). Para esse lojista, o software não é uma "ferramenta barata de link", mas a infraestrutura digital crítica da sua loja física.
*   **O Posicionamento:** Ancoragem de preço premium. O software se posiciona como um investimento de ROI óbvio, quase uma "taxa de franquia digital" insignificante diante do capital de giro físico, promovendo altíssima retenção e fidelidade.

### B) Vendedores Independentes e Profissionais Liberais (Foco B2C - Essential)
*   **A Persona:** Autônomos, consultores de vendas e revendedores multimarcas de e-commerce tradicionais.
*   **O Contexto:** Necessidade de agilidade, baixo custo de entrada e alto apelo estético para se destacar no Instagram e WhatsApp.
*   **O Posicionamento:** Funciona como um plano de entrada ("isca de conversão") focado em volume e marketing viral de boca em boca.

---

## 3. A Esteira de Planos & Motor de PLG (Product-Led Growth)

### 3.1 Grade de Planos do SaaS
Desenhada para viabilizar o crescimento saudável e a infraestrutura gratuita do Supabase/Vercel (limitada a 1GB de Storage e 500MB de Banco de Dados) sem asfixiar os recursos do servidor:

| Plano | Preço Mensal | Limite de Produtos | Limite de Vendedores | Público-Alvo e Justificativa de Armazenamento |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** | R$ 47,00 | Até 10 Produtos | 1 Vendedor | Autônomos genéricos. Limita o consumo de armazenamento de imagens. |
| **Basic** | R$ 97,00 | Até 50 Produtos | 3 Vendedores | Pequenas lojas e operações em tração inicial. |
| **Pro** | R$ 147,00 | Até 200 Produtos | 10 Vendedores | Lojistas em escala com equipes de vendas regionais. |
| **Enterprise** | R$ 197,00 | Ilimitado | Ilimitado | Persona principal (Lojas Maj). Suporta custos de tiers pagos da infraestrutura. |

### 3.2 O Motor Financeiro Autônomo (Billing Engine)
*   **Transações Sem Gateways Iniciais:** O motor financeiro é controlado nativamente pela tabela `invoices` vinculada às `organizations`.
*   **Cron Diário (`/api/cron/daily-routines`):** Roda diariamente em segundo plano no Next.js, gerando automaticamente faturas com status `PENDENTE` no dia de aniversário da conta.
*   **Gatilhos de Upsell Automatizados (PLG):** O cronjob monitora o uso de recursos de cada inquilino. Se o cliente atingir **80% do limite** de produtos ou vendedores do seu plano, o sistema dispara um e-mail de oferta de upgrade automática. Essa automação pode ser desativada manualmente (*Toggle Auto Upsell*) para contas VIP no painel do Super Admin (QG).

---

## 4. Pilares Arquiteturais & Diferenciais Tecnológicos

### 4.1 CaaS (Catalog as a Service) & Modelo de Franquias
A arquitetura do PlataformaShop permite que uma organização matriz (ex: **MAJ Master**) distribua catálogos centrais para toda a sua rede de revendedores e franquias:
*   **Sigilo de Custos:** A tabela de produtos mestre mantém o custo original oculto.
*   **Preço e Disponibilidade Personalizados:** Franqueados não podem apagar produtos CaaS, mas têm autonomia total para definir margens de lucro e status por meio de uma tabela paralela de overrides (`organization_product_overrides`).
*   **Atacado vs. Varejo Inteligente:** O cartão virtual do vendedor (`/p/[slug]`) detecta automaticamente o perfil do cliente e o `business_model` da organização para exibir preços de atacado (`price_b2b`) ou varejo (`price_b2c`) dinamicamente.

### 4.2 Equivalência Operacional (B2C Admin ≡ B2B Vendedor)
O sistema unifica a experiência operacional. O painel administrativo de um vendedor B2B debaixo de uma grande organização é estruturalmente idêntico ao painel de um lojista B2C autônomo. Ambos possuem acesso às mesmas ferramentas premium: catálogo vitrine, recesso de vendas, personalização de horários e redirecionamento de leads.

### 4.3 Integração Físico-Digital (Tags NFC)
O PlataformaShop conecta o espaço físico ao digital através de cartões e adesivos NFC (Near Field Communication).
*   **Aproximação Nativa:** O celular do cliente interage com a Tag física por indução magnética, abrindo instantaneamente o mini-site do vendedor (`plataformashop.com.br/[slug]`), sem necessidade de instalar aplicativos ou focar câmeras em QR Codes.
*   **Estratégias de Entrada:** 
    *   *Self-Service:* O painel orienta o cliente a gravar suas próprias tags usando ferramentas gratuitas (NFC Tools) e disponibiliza a geração de arquivos `.vcf` (vCard) para salvar o contato diretamente na agenda do smartphone.
    *   *Hardware Personalizado:* Venda de cartões corporativos em PVC, Madeira e Metal via e-commerce integrado ao painel, ativados dinamicamente no primeiro login (`/activate/[id]`).

### 4.4 Lógica de Disponibilidade e Feriados Inteligentes
O sistema garante que nenhum catálogo anuncie produtos quando a loja ou vendedor estiver impossibilitado de atender:
1.  **Recesso Temporário (Modo Férias):** Desliga instantaneamente as compras ou exibe banners informativos em toda a vitrine.
2.  **Hierarquia de Horários:** Verifica primeiro o horário personalizado do vendedor; se não houver, herda o da empresa; se falhar, adota o padrão comercial (Seg-Sex 08-18h, Sáb 08-12h).
3.  **Consulta Dinâmica de Feriados (BrasilAPI):** O gestor ativa o fechamento automático em feriados nacionais. O sistema avisa o vendedor com antecedência, salvando a preferência de folga e ativando pausas automáticas baseadas no fuso horário `"America/Sao_Paulo"`.

### 4.5 Engenharia UX Premium (Resiliência do Frontend)
*   **React Portals:** Todas as modais e overlays críticos são renderizados via `createPortal(..., document.body)` para evitar cortes visuais decorrentes do Stacking Context (contextos de isolamento CSS gerados por animações `framer-motion` e Tailwind).
*   **Smart Y-Axis Positioning em iFrames:** Para evitar problemas de double scrollbars em embeds de sites externos (iFrames de até 5000px de altura), o sistema monitora a coordenada exata do clique (`e.pageY`) para renderizar modais flutuantes na altura do olhar do usuário, enquanto substitui modais por acordions em smartphones.
*   **Word Wrapping Otimizado:** Layouts à prova de quebras bruscas usando `overflow-wrap: break-word` combinados com sanitização e normalização de textos complexos.

---

## 5. Governança e Sustentabilidade da Infraestrutura
Para operar dentro das restrições de custos controlados, a governança técnica e de código é estrita:
*   **Watchdog do Telegram:** Um script monitora os limites do Supabase (Thresholds de 75% a 95% para DB e Imagens), enviando alertas em tempo real ao canal administrativo.
*   **Prevenção de Monolitos:** Um contador persistente bloqueia a escrita de arquivos TypeScript/TSX com mais de 500 linhas, forçando a refatoração modular.
*   **Zero-Hex em JSX:** Proibição de cores hexadecimais embutidas no código das páginas, obrigando a utilização das variáveis centralizadas do CSS Design System.

---

## 6. Próximos Passos
O PlataformaShop consolida o mercado de micro-landing pages de negócios no Brasil. Suas metas de curto prazo incluem a ativação do checkout automatizado e a consolidação logística da venda de cartões de aproximação NFC personalizados para grandes redes.
