# Estratégia Financeira, Preços e Upsell (Maj Mobilidade)

Este documento centraliza as decisões táticas e a arquitetura desenvolvidas durante as sessões de alinhamento (`/grill-me`) sobre o sistema financeiro, cobranças automatizadas e os limites dos planos da PlataformaCard / Maj Mobilidade.

---

## 1. Persona e Posicionamento

A plataforma tem como alvo o mercado de mobilidade elétrica, especificamente franqueados/investidores da **Maj Mobilidade Elétrica**.

*   **Público-alvo principal:** Empresários (25+ anos).
*   **Barreira de Entrada:** Investimento inicial focado na compra de estoque no atacado (mínimo de 3 scooters elétricas, variando de 5k a 7k cada), além da exigência de CNPJ, infraestrutura de loja física e suporte técnico.
*   **Posicionamento do Software:** O aplicativo não pode ser "barato demais" a ponto de desvalorizar a percepção premium de uma operação complexa de mobilidade, mas também não pode ser inacessível para quem já mobilizou um capital na casa dos 20k a 30k. O preço deve ancorar autoridade com uma proposta de valor (ROI) óbvia.

## 2. A Esteira de Planos (SaaS)

Com base no perfil "Atacadista/Lojista", ancoramos o produto **Premium/Ilimitado no valor de R$ 197,00 mensais**, desenhando uma esteira de retenção e "degraus" (Upsell) abaixo dele. Também criamos um plano *Starter* ultracessível focado em captar vendedores pulverizados que estão fora do nicho de mobilidade e não demandam loja física.

### Estrutura de Precificação Inteligente

1.  **Starter (R$ 47/mês)**
    *   *Objetivo:* Plano isca para vendedores genéricos (fora da Maj Mobilidade) ou revendedores menores de e-commerce e catálogo.
    *   *Limites:* Até 10 Produtos | 1 Vendedor
2.  **Basic (R$ 97/mês)**
    *   *Objetivo:* Início de pequenas operações, focado em lojistas que estão tracionando os primeiros clientes e catálogos B2B/B2C enxutos.
    *   *Limites:* Até 50 Produtos | 3 Vendedores
3.  **Pro (R$ 147/mês)**
    *   *Objetivo:* Escala. Lojistas Maj Mobilidade com catálogos completos de peças, patinetes, scooters e acessórios, com equipe de vendas.
    *   *Limites:* Até 200 Produtos | 10 Vendedores
4.  **Enterprise (R$ 197/mês)**
    *   *Objetivo:* Foco total na persona principal. Autoridade máxima. Operações de grande porte. Sem limites de recursos.
    *   *Limites:* Ilimitado de Produtos | Ilimitado de Vendedores

> [!TIP]
> **Vantagem Estratégica:** Ao cobrar R$ 197 pelo plano máximo ilimitado (comparado aos R$ 7.000 de uma única scooter), a fricção de venda do software é zero. Ele entra quase como uma "taxa de franquia digital" irrelevante perto do investimento físico, mas garante para nós uma altíssima retenção e receita recorrente escalável (MRR).

---

## 3. Motor Financeiro Automático (Billing Engine)

Para evitar integrações iniciais exaustivas com Gateways de Pagamento e focar na validação, construímos um **motor de faturamento próprio (Extrato)** 100% automatizado, com controle pelo Super Admin.

*   **Tabelas Nativas:** As faturas não dependem de API externa (criamos a tabela `invoices` no Supabase, vinculada às `organizations`).
*   **Cron Job Diário (Next.js API Route):**
    *   O endpoint `/api/cron/daily-routines` roda todos os dias em background.
    *   Ele varre todas as empresas ativas na plataforma.
    *   **Geração de Fatura:** Se o dia atual for o "aniversário" da conta (baseado na data em que a empresa foi criada `created_at`), o motor gera uma fatura automática com o valor do plano vigente e status `PENDENTE`.

## 4. Gatilhos de Expansão e Retenção (Automated Upsell)

Implementamos inteligência para converter os clientes dos planos mais baratos em planos superiores, baseada em **Uso de Recursos (Product-Led Growth)**.

*   **Avaliador de Upsell Integrado ao Cron:** 
    *   Todos os dias, junto da checagem financeira, o sistema cruza a contagem atual de vendedores/produtos do cliente com os limites do plano (ex: Basic, Pro).
    *   **Regra de 80%:** Se a utilização de *qualquer* recurso (produtos ou membros) atingir ou ultrapassar 80% do teto contratado, o gatilho é disparado.
    *   **Ação:** Envio automático de E-mail de Oferta de Upgrade (avisando o lojista que o limite está próximo e sugerindo o próximo plano).
*   **Controle Híbrido:** O envio dessas mensagens automáticas pode ser desligado individualmente. O painel de Raio-X do cliente (Super Admin) possui uma chave seletora (*Toggle Auto Upsell*) permitindo que o gestor decida não importunar uma determinada conta.

---

## 5. Próximos Passos (Evolução Financeira)

1.  **Pagamento Real:** Assim que a rede crescer, conectar o modelo híbrido interno (Tabela Invoices) a um gateway real (Stripe / Pagar.me) via Webhooks para trocar automaticamente o status de `PENDENTE` para `PAID` via PIX/Cartão.
2.  **Métricas SaaS:** Criação do Dashboard de Receita no Super Admin para acompanhar (MRR - Receita Recorrente Mensal), Churn (cancelamentos) e Inadimplência (Faturas `OVERDUE`).
