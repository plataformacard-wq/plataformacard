# Especificação Oficial de Produtos, Planos e Recursos — PlataformaShop

*Data de Atualização: 24 de julho de 2026*  
*Versão da Matriz: 2.1 (Sincronizada com Kiwify Checkout & Vercel API)*

---

## 📌 Visão Geral do Modelo de Negócios

A **PlataformaShop** opera sob o modelo **SaaS (Software as a Service) com Taxa 0% sobre Vendas**. Os lojistas e empresas parceiras pagam uma assinatura fixa (mensal ou anual) para utilizar a infraestrutura completa de vitrine digital, inteligência artificial, sincronização ERP e gestão de vendas.

### Princípios da Precificação:
1. **Taxa 0% nas Vendas:** Nenhuma comissão é cobrada sobre os pedidos finalizados no WhatsApp.
2. **Desconto de Ancoragem no Ciclo Anual:** Assinantes do plano anual recebem até **33% de desconto** no valor mensal acumulado.
3. **Checkout Seguro via Kiwify:** Pagamento automatizado por Pix e Cartão de Crédito (em até 12x), com liberação instantânea de recursos via Webhook nativo.

---

## 🚀 Detalhamento dos Produtos / Planos

### 1. Plano STARTER — *Autônomos e Pequenos Negócios*
Designed para profissionais autônomos, prestadores de serviço e pequenos lojistas que desejam migrar de catálogos em PDF ou postagens de redes sociais para uma vitrine digital profissional de rápida conversão.

* **Público-Alvo:** Autônomos, lojas locais, artesanato, boutique iniciante.
* **Preço Mensal:** **R$ 59,90 / mês** *(Preço de tabela riscado: R$ 89,90)*
* **Preço Anual:** **R$ 39,90 / mês** *(Faturado anualmente em R$ 478,80 — Economia de R$ 240,00/ano)*
* **Capacidade de Catálogo:** Até **100 Produtos**
* **Usuários/Equipe:** **1 Usuário** (Acesso Gestor)

#### 📦 Recursos Inclusos:
- ✅ **Vitrine Digital Responsiva:** Interface otimizada para mobile e desktop com carregamento ultrarrápido (Next.js Turbopack).
- ✅ **Checkout Direto no WhatsApp:** Envio do carrinho formatado com itens, variações e valores para o WhatsApp do lojista.
- ✅ **Taxa 0% nas Vendas:** 100% do valor da venda fica com o lojista.
- ✅ **Subdomínio PlataformaShop:** Endereço exclusivo (`plataformashop.com.br/p/sualoja`).
- ✅ **Gestão de Produtos e Categorias:** Organização simplificada de itens, imagens e variações básicas.
- ✅ **Horário de Funcionamento Dinâmico:** Indicador visual de loja aberta/fechada.
- ✅ **Suporte Padrão:** Atendimento via e-mail e ticket.

---

### 2. Plano PRO — *Escala e Automação (Recomendado ⭐)*
O plano mais popular da plataforma. Desenvolvido para empresas consolidadas que precisam de marca própria, automação de SEO por Inteligência Artificial e integração contínua com ERP de estoque.

* **Público-Alvo:** Lojas virtuais em crescimento, e-commerces regionais, distribuidores locais.
* **Preço Mensal:** **R$ 149,90 / mês** *(Preço de tabela riscado: R$ 229,90)*
* **Preço Anual:** **R$ 99,90 / mês** *(Faturado anualmente em R$ 1.198,80 — Economia de R$ 600,00/ano)*
* **Capacidade de Catálogo:** Até **1.000 Produtos**
* **Usuários/Equipe:** Até **3 Usuários** na mesma organização

#### 📦 Recursos Inclusos:
- ✅ **Tudo do Plano STARTER +**
- ✅ **Domínio Próprio com SSL Automático:** Uso do seu próprio domínio (`sualoja.com.br`) com certificado HTTPS gerenciado via Vercel API.
- ✅ **Assistente de IA para SEO & Copywriting (Gemini):** Geração automática de títulos persuasivos, descrições detalhadas e textos de destaque otimizados para buscadores (Google e IA Search Engine).
- ✅ **Sincronização de Estoque Bling ERP (V3):** Conexão nativa por SKU para atualizar o saldo de estoque automaticamente.
- ✅ **Inteligência de Estoque & Reordenamento:** Envio automático de produtos esgotados para o fim da vitrine e alertas visuais de baixo estoque.
- ✅ **Personalização Avançada de Marca:** Banners customizados, carrosséis promocionais e stickers de status.
- ✅ **Auditoria de Qualidade com IA:** Filtro de sugestões para revisão antes de publicar alterações no produto.

---

### 3. Plano PREMIUM (SALES TEAM) — *Corporativo e Multi-Vendedor*
Solução completa para médias e grandes empresas, redes de distribuição, franquias e equipes comerciais que necessitam de múltiplos vendedores, CRM de vendas e arquitetura CaaS (Catalog as a Service).

* **Público-Alvo:** Distribuidores B2B, indústrias, equipes comerciais com representantes, franquias.
* **Preço Mensal:** **R$ 299,90 / mês** *(Preço de tabela riscado: R$ 449,90)*
* **Preço Anual:** **R$ 199,90 / mês** *(Faturado anualmente em R$ 2.398,80 — Economia de R$ 1.200,00/ano)*
* **Capacidade de Catálogo:** Até **5.000 Produtos**
* **Usuários/Equipe:** Até **10 Vendedores/Usuários** com controle granular de permissões

#### 📦 Recursos Inclusos:
- ✅ **Tudo do Plano PRO +**
- ✅ **Gestão Multi-Vendedor B2B & CRM Integrado:** Distribuição e atribuição inteligente de atendimento por vendedor, com quadro Kanban para acompanhamento de leads.
- ✅ **Catálogo Mestre CaaS (Catalog as a Service):** Funcionalidade para clonar, gerenciar e distribuir catálogos matriz para filiais, lojas parceiras ou representantes.
- ✅ **Ajuste de Preços em Massa (Bulk Pricing):** Reajuste percentual ou valor fixo em massa para categorias inteiras ou todo o catálogo.
- ✅ **Relatórios e Analytics Avançados:** Métricas de acessos por produto, taxa de conversão por vendedor e categorias mais buscadas.
- ✅ **Suporte VIP Prioritário:** Atendimento via WhatsApp exclusivo com gerente de contas e SLA reduzido.

### 4. Modalidade ALL SERVICE — *Omnichannel, Franquias e Redes Enterprise*
O modelo **ALL SERVICE** (originalmente denominado HÍBRIDA no banco de dados) é a arquitetura topo de linha da plataforma. Ele unifica **B2C, B2B e CaaS (Catalog as a Service)** em uma única estrutura organizacional, sendo exclusivo para marcas que possuem redes de franquias, representantes ou operações omnicanal complexas.

* **Público-Alvo:** Redes de franquias, licenças de marca, grandes indústrias com vendas diretas e indiretas.
* **Modelo de Negócio no Sistema:** `ALL_SERVICE` (registrado na tabela `organizations.business_model`).
* **Enquadramento de Plano:** Disponibilizado no plano **PREMIUM (Sales Team)** ou via **Plano ENTERPRISE sob Consulta** gerenciado pelo QG Super Admin.

#### 📦 Recursos Exclusivos do Modelo ALL SERVICE:
- ✅ **Gestão de Franquias (`/dashboard/franquias`):** Módulo liberado exclusivamente para contas `ALL_SERVICE` para criar catálogos matriz, gerenciar franqueados e enviar convites de vinculação de catálogo.
- ✅ **Criação de Catálogos Matriz CaaS:** Permite que a matriz crie um catálogo mestre cujos produtos, categorias e imagens são propagados automaticamente para a rede de franqueados.
- ✅ **Operação Híbrida Simultânea:**
  - **B2C Ativo:** Cartão público, vitrine B2C e atendimento direto via WhatsApp.
  - **B2B Ativo:** Colaboradores, vendedores, gestão de limite de crédito e tabela diferenciada.
  - **CaaS Ativo:** Distribuição para terceiros via API e clone de vitrine.
- ✅ **Visão Unificada no QG Super Admin:** Status com badge dedicada (`bg-zinc-900`) no painel de gestão global de empresas.

---

## 📊 Tabela Comparativa de Recursos (Feature Matrix)

| Recurso / Funcionalidade | STARTER | PRO (Recomendado) | PREMIUM (Sales Team) | ALL SERVICE (Enterprise / Franquias) |
| :--- | :---: | :---: | :---: | :---: |
| **Valor Mensal** | R$ 59,90/mês | R$ 149,90/mês | R$ 299,90/mês | Sob Consulta / Premium |
| **Valor Anual (por mês)** | **R$ 39,90/mês** | **R$ 99,90/mês** | **R$ 199,90/mês** | Sob Consulta / Premium |
| **Economia Anual** | R$ 240,00 | R$ 600,00 | R$ 1.200,00 | Customizada |
| **Limite de Produtos** | 100 produtos | 1.000 produtos | 5.000 produtos | Ilimitado / Customizado |
| **Limite de Usuários** | 1 usuário | 3 usuários | 10 usuários | Customizado |
| **Taxa sobre Vendas** | **0%** | **0%** | **0%** | **0%** |
| **Checkout no WhatsApp** | Sim | Sim | Sim | Sim |
| **Subdomínio Gratuito** | Sim | Sim | Sim | Sim |
| **Domínio Próprio SSL** | ❌ | **Sim (`sualoja.com.br`)** | **Sim (`sualoja.com.br`)** | **Sim (Multi-domínio)** |
| **IA para SEO e Copy (Gemini)** | ❌ | **Sim** | **Sim** | **Sim** |
| **Estoque Bling ERP (V3)** | ❌ | **Sim** | **Sim** | **Sim** |
| **Inteligência de Esgotados** | ❌ | **Sim** | **Sim** | **Sim** |
| **Multi-Vendedor & CRM Kanban** | ❌ | ❌ | **Sim** | **Sim** |
| **Catálogo Mestre CaaS & Franquias** | ❌ | ❌ | ❌ | **Sim (`/dashboard/franquias`)** |
| **Ajuste de Preços em Massa** | ❌ | ❌ | **Sim** | **Sim** |
| **Suporte** | Padrão (Ticket) | Prioritário | VIP (WhatsApp Direto) | Gerente de Contas Dedicado |

---

## 🔐 Integração Técnica e Validação no Código

Toda a regra de concessão de acesso e verificação dos planos está codificada e protegida no sistema através dos seguintes módulos:

1. **Matriz Programática (`lib/plans/feature-matrix.ts`):**  
   Define as constantes de preço, limites de produtos/usuários e as chaves de recursos (`allowedFeatures`).
2. **Feature Gate Hook (`hooks/useFeatureGate.ts`):**  
   Controla o acesso em tempo de execução aos botões e telas exclusivas dos planos superiores.
3. **Webhook de Cobrança (`app/api/webhooks/kiwify/route.ts`):**  
   Processa o evento `order_approved` ou `subscription_renewed` da Kiwify para atualizar o plano da organização no Supabase de forma atômica.
4. **Links Oficiais de Checkout Kiwify:**
   - **Starter Mensal:** `https://pay.kiwify.com.br/o58QqJP` | **Starter Anual:** `https://pay.kiwify.com.br/JYPy0Ec`
   - **PRO Mensal:** `https://pay.kiwify.com.br/exQ3L5T` | **PRO Anual:** `https://pay.kiwify.com.br/H8G4uuU`
   - **Premium Mensal:** `https://pay.kiwify.com.br/LkBViNa` | **Premium Anual:** `https://pay.kiwify.com.br/DcSyq23`
