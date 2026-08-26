# 🧪 Plano de Auditoria e Validação Técnica — Módulo Zeon B2B

> **Documento Oficial de Homologação:** Este plano guia a equipe da **PlataformaShop** e da **Maj Mobilidade** na execução dos testes e validação fim-a-fim (E2E) dos recursos do **Módulo Zeon B2B**.

---

## 📌 Objetivos da Auditoria

1. **Garantir a Integridade do Banco de Dados:** Confirmar que a migração `20260826_b2b_hybrid_portal.sql` foi aplicada no Supabase e que as tabelas de clientes, preços e pedidos possuem RLS correto.
2. **Validar a Sincronização Google Sheets:** Garantir que o parser leia planilhas públicas por SKU e atualize as tabelas X, Y, Z sem afetar os cadastros base do Bling ERP.
3. **Homologar os Fluxos Híbridos de Acesso:** Testar o Convite Direto (Fluxo A / Outbound) e a Solicitação de Novo Lojista com Retenção (Fluxo B / Inbound).
4. **Verificar a Integração com Bling ERP v3:** Garantir que a finalização do pedido B2B crie um Pedido de Venda via API v3 do Bling com o SKU e os valores negociados.

---

## 🛠️ Checklist de Pré-Requisitos (Antes de Iniciar os Testes)

- [ ] **Migração SQL Aplicada:** Executar o script `supabase/migrations/20260826_b2b_hybrid_portal.sql` no Supabase SQL Editor.
- [ ] **Variáveis de Ambiente:** Confirmar presença de `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BLING_CLIENT_ID` e `BLING_CLIENT_SECRET`.
- [ ] **Compilação sem Erros:** Rodar `npx tsc --noEmit` localmente (deve retornar 0 erros).
- [ ] **Servidor Dev Rodando:** Aplicação ativa em `http://localhost:3000` (ou ambiente de homologação na Vercel).

---

## 🧪 Cenários de Teste Fim-a-Fim (E2E Test Cases)

---

### 📋 Cenário 1: Sincronização de Tabelas via Google Sheets

* **Objetivo:** Verificar se os preços atacadistas por SKU são lidos da planilha e atualizados no Supabase.
* **Passos para Execução:**
  1. Acesse o Dashboard em `http://localhost:3000/dashboard/b2b`.
  2. Clique na aba **"Google Sheets"**.
  3. Insira o ID de uma planilha pública do Google Sheets (ex: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`) e defina a aba como `Precos`.
  4. Clique no botão **"Sincronizar Planilha Agora"**.
* **Resultado Esperado:**
  - Exibição da mensagem de sucesso: *"X SKUs sincronizados com sucesso!"*.
  - A tabela `b2b_sku_prices` no Supabase deve conter os objetos JSON com os preços por SKU das colunas `bling`, `tabela_x`, `tabela_y`, `tabela_z`.

---

### 🔒 Cenário 2: Fluxo Outbound (Convite Direto em 1-Clique)

* **Objetivo:** Validar o cadastro manual de parceiro conhecido e o acesso direto com a Tabela Y.
* **Passos para Execução:**
  1. No Dashboard `/dashboard/b2b`, clique no botão **"Cadastrar Lojista (Outbound)"**.
  2. Preencha CNPJ (`12.345.678/0001-90`), Razão Social (`Empresa Teste Outbound LTDA`), WhatsApp (`31999998888`) e selecione **"Tabela Y (Margem Ajustada)"**.
  3. Clique em **"Cadastrar & Liberar Link"**.
  4. Copie o link exclusivo gerado (`http://localhost:3000/majmobilidade?b2b=TOKEN_EXCLUSIVO`).
  5. Abra uma **janela anônima** no navegador e acesse o link.
* **Resultado Esperado:**
  - O catálogo da Maj Mobilidade carrega exibindo o banner verde *"Empresa Teste Outbound LTDA — B2B Logado"*.
  - A indicação de tabela exibe *"Tabela de Preços Exclusiva: TABELA Y"*.
  - Os preços exibidos na vitrine correspondem exatamente aos valores da Tabela Y salvos na sincronização.

---

### ⏳ Cenário 3: Fluxo Inbound (Solicitação de Novo Lojista com Retenção)

* **Objetivo:** Testar a solicitação iniciada pelo lojista no site e a aprovação posterior do gestor.
* **Passos para Execução:**
  1. Em uma janela anônima sem estar logado em B2B, acesse `http://localhost:3000/majmobilidade`.
  2. No topo do catálogo, clique no botão **"Quero ser Revendedor"**.
  3. Preencha CNPJ (`98.765.432/0001-10`), Razão Social (`Novo Lojista Inbound LTDA`) e WhatsApp (`31988887777`). Clique em **"Solicitar Acesso B2B"**.
  4. Verifique a exibição da tela de retenção: *"🎉 Solicitação recebida com sucesso! Nossos analistas estão preparando ofertas e condições especiais para o perfil da sua empresa..."*.
  5. Abra o Dashboard `/dashboard/b2b` na aba **"Solicitações Pendentes (1)"**.
  6. Localize o cliente `Novo Lojista Inbound LTDA`, selecione **"Tabela Z (Plus / Atacado)"** e clique em **"Aprovar & Disparar WhatsApp"**.
* **Resultado Esperado:**
  - O cliente muda do status `pending_approval` para `approved`.
  - A janela do WhatsApp abre com a mensagem formatada contendo o link exclusivo de acesso para o lojista.

---

### 📦 Cenário 4: Pedido em Lote B2B & Envio para o Bling ERP v3

* **Objetivo:** Testar a montagem de carrinho B2B e a emissão do Pedido de Venda na API v3 do Bling.
* **Passos para Execução:**
  1. Estando logado no catálogo como cliente B2B (via `?b2b=TOKEN`), clique no botão **"Pedido em Lote B2B"**.
  2. No modal da grade de compra, adicione quantidades para 2 ou mais produtos (ex: 3x Produto A, 5x Produto B).
  3. Observe se o cálculo do subtotal e do valor total utiliza os valores atacadistas da tabela atribuída.
  4. Clique em **"Finalizar Pedido B2B"**.
* **Resultado Esperado:**
  - O modal exibe a confirmação de sucesso com a mensagem *"Pedido B2B Concluído!"*.
  - Se a conta do Bling estiver conectada na org, exibe a confirmação *"Integrado no Bling ERP (ID: XXXXX)"*.
  - No banco Supabase, um novo registro surge na tabela `b2b_orders` com o `total_amount` e a lista de itens.
  - No painel do Bling ERP da Maj Mobilidade (`Vendas > Pedidos de Vendas`), o pedido de venda surge listando os SKUs e os valores negociados.

---

## 🤖 Script de Teste Automatizado de Sanidade (CLI)

Para executar um teste rápido de sanidade da API localmente sem abrir a interface, rode o comando abaixo no terminal:

```bash
node -e '
async function testB2bApi() {
  const baseUrl = "http://localhost:3000";
  console.log("🔍 Testando API B2B Clients...");
  const res = await fetch(`${baseUrl}/api/b2b/clients?slug=majmobilidade`);
  const data = await res.json();
  console.log("Status API Clients:", res.status, "Clientes encontrados:", data.clients?.length || 0);
}
testB2bApi();
'
```

---

## 📝 Registro e Relatório de Homologação

- **Data da Auditoria:** ____/____/2026
- **Auditor Responsável:** ________________________
- **Status Geral:** [  ] APROVADO PARA PRODUÇÃO   [  ] REPROVADO (REQUER AJUSTES)
- **Observações / Anotações:** __________________________________________________
