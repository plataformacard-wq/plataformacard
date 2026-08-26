# PROMPT DE CONTINUIDADE - PLATAFORMASHOP

Este documento é a **Fonte Única de Verdade (SSOT)** para encerramento e retomada de sessão de desenvolvimento.

---

## 1. Status das Entregas Concluídas

- [x] **Protocolo START & Auditoria UX/UI:**
  - Sincronização com `origin/main` efetuada com sucesso.
  - Servidor Next.js dev ativo em `http://localhost:3000`.
  - Calibração do motor `audit_ux_ui.js` para respeitar a hierarquia de cantos arredondados: container (`rounded-[27px]`), sub-cards (`rounded-2xl`), badges/stickers (`rounded-full`) e botões (`rounded-xl`).
- [x] **Implementação e Harmonização do Modal Status 360° do Produto:**
  - Integrado em todo o ecossistema: Catálogo ([CatalogProductItem.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/catalogo/CatalogProductItem.tsx), [CatalogoClient.tsx](file:///c:/Users/Start/PlataformaShop/app/dashboard/catalogo/CatalogoClient.tsx), [ProductListItem.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/ProductListItem.tsx)), Estoque ([EstoqueManualTab.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/estoque/EstoqueManualTab.tsx)), Busca Rápida ([QuickSearchProductModal.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/QuickSearchProductModal.tsx)) e Gaveta ([ProductDetailDrawer.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/ProductDetailDrawer.tsx)).
- [x] **Correção no Filtro de Colaboradores da Busca Preditiva:**
  - [HeaderSearchPopover.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/header/HeaderSearchPopover.tsx) e [PanelLayout.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/PanelLayout.tsx) ajustados para filtrar exclusivamente colaboradores e vendedores reais (`role === 'seller' | 'manager'`), impedindo que administradores apareçam indevidamente como "Vendedor".
- [x] **Landing Page — Mockups de Recursos B2B (Seção `#recursos`):**
  - Suporte nativo à troca automática de temas Dark/Light implementado em [app/page.tsx](file:///c:/Users/Start/PlataformaShop/app/page.tsx).
  - **Card 1 (Taxa Zero nas Vendas):** Entregue com `mockup_taxa_zero_light.png` e `mockup_taxa_zero_dark.png`.
  - **Card 2 (Estoque Sincronizado - Bling ERP V3):** Entregue com `mockup_estoque_bling_v3_light.png` e `mockup_estoque_bling_v3_dark.png`.
  - **Card 3 (Físico e Digital - NFC Híbrido):** Entregue com `nfc_hibrido_light.png` e `nfc_hibrido_dark.png`.
  - **Card 4 (Incorpore no seu Site - iFrame):** Entregue com `iframe_embed_light.png` e `iframe_embed_dark.png`.
  - Todos os containers calibrados na proporção exata 4:3 (`aspect-[2400/1792]`) com `object-cover` e sombra `shadow-2xl`.
- [x] **Módulo B2B (Plano Zeon) — Portal Híbrido, Google Sheets & Bling ERP v3:**
  - Migração SQL executada em `supabase/migrations/20260826_b2b_hybrid_portal.sql`.
  - Sincronizador de planilhas Google Sheets por SKU em `lib/google-sheets.ts` e API `/api/b2b/sync-sheets`.
  - Gestão B2B no Dashboard em [app/dashboard/b2b/page.tsx](file:///Users/macstudio-maj/Documents/Desenvolvimento/Aplicativos/PlataformaShop/app/dashboard/b2b/page.tsx) com abas para clientes aprovados, solicitações pendentes e integração Google Sheets.
  - Onboarding Híbrido: Convite Direto em 1-clique (Outbound) e Solicitação Inbound no catálogo [components/catalog/B2bRegisterModal.tsx](file:///Users/macstudio-maj/Documents/Desenvolvimento/Aplicativos/PlataformaShop/components/catalog/B2bRegisterModal.tsx) com mensagem de retenção *"Preparando ofertas..."*.
  - Grade de Pedido em Lote B2B em [components/catalog/B2bFastOrderModal.tsx](file:///Users/macstudio-maj/Documents/Desenvolvimento/Aplicativos/PlataformaShop/components/catalog/B2bFastOrderModal.tsx) com envio de Pedido de Venda via API v3 do Bling (`POST /pedidos/vendas`).
  - **Plano de Auditoria Registrado:** Documento de teste e homologação disponível em [`[documentation]/manuais/PLANO_AUDITORIA_ZEON_B2B.md`](file:///Users/macstudio-maj/Documents/Desenvolvimento/Aplicativos/PlataformaShop/%5Bdocumentation%5D/manuais/PLANO_AUDITORIA_ZEON_B2B.md).
- [x] **Compilação e Tipagem:**
  - Validação estrita via `npx tsc --noEmit` obtendo **0 erros de compilação**.

---

## 2. Próxima Sessão / Roteiro de Auditoria do Portal B2B

Para validar o Módulo B2B Zeon em uma nova sessão, siga os passos do documento [`PLANO_AUDITORIA_ZEON_B2B.md`](file:///Users/macstudio-maj/Documents/Desenvolvimento/Aplicativos/PlataformaShop/%5Bdocumentation%5D/manuais/PLANO_AUDITORIA_ZEON_B2B.md):

1. **Executar a Migração SQL no Supabase:** Rodar o script `supabase/migrations/20260826_b2b_hybrid_portal.sql`.
2. **Cenário 1 (Google Sheets):** No Dashboard `/dashboard/b2b`, aba *Google Sheets*, sincronizar a planilha de preços por SKU.
3. **Cenário 2 (Convite Direto):** Cadastrar cliente no Dashboard ➔ Copiar link `?b2b=TOKEN` ➔ Abrir em janela anônima e conferir preços da Tabela Y.
4. **Cenário 3 (Solicitação Inbound):** No catálogo `/majmobilidade`, clicar em *"Quero ser Revendedor"* ➔ Preencher formulário ➔ Aprovar no Dashboard selecionando a Tabela Z.
5. **Cenário 4 (Pedido B2B + Bling):** Abrir *"Pedido em Lote B2B"*, selecionar itens e finalizar ➔ Verificar gravação no Supabase e envio do Pedido de Venda para o Bling ERP.

