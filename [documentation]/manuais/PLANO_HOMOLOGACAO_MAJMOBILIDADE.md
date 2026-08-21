# 🧪 Plano de Homologação e Teste Real Online — Maj Mobilidade

> **Nota de Contexto Especial:** Este documento registra a entrada da PlataformaShop na **fase de teste real e online**. Trata-se de uma validação atípica de campo conduzida diretamente com a **Maj Mobilidade**, utilizando produtos e estoque reais conectados via Bling ERP v3 em ambiente online (`www.plataformashop.com.br`).

---

## 📌 Objetivos da Homologação Online

1. **Validação Operacional da Inteligência de Estoque:** Testar em ambiente de produção os gráficos, modais detalhados, alertas de estoque baixo e esgotado (`StockIntelligenceSection`).
2. **Sincronização em Tempo Real (Bling ERP v3):** Garantir que os saldos de estoque e SKUs sincronizados do Bling reflitam com precisão no dashboard.
3. **Navegação & Busca Preditiva:** Testar o novo *Live Search Popover* (`TopHeader` / `HeaderSearchPopover`) em produção com o catálogo real da Maj Mobilidade.

---

## 🌐 Mapeamento de Endereços Online

| Recurso | Endereço Online | Descrição |
| :--- | :--- | :--- |
| **Vitrine Pública (Catálogo)** | `https://www.plataformashop.com.br/majmobilidade` | Vitrine digital da Maj Mobilidade acessível publicamente para clientes |
| **Painel de Gestão (Dashboard)** | `https://www.plataformashop.com.br/entrar` | Acesso autenticado da Maj para gerenciar e visualizar o Analítico de Estoque |
| **Busca Preditiva & Modais** | `https://www.plataformashop.com.br/dashboard` | Acesso rápido aos produtos por Live Search e modais de estoque global |

---

## 🛠️ Checklist Técnico de Ativação

- [x] **Domínio Principal Conectado:** `www.plataformashop.com.br` ativo no Vercel e servindo via SSL.
- [x] **Middleware & Roteamento:** Suporte nativo a `plataformashop` configurado em `middleware.ts`.
- [x] **Compilação e Tipagem:** Projeto auditado e validado com `npx tsc --noEmit` (0 erros).
- [ ] **Validação de Login & RLS:** Acesso da Maj via `/entrar` com `organization_id` correspondente a `majmobilidade`.
- [ ] **Sincronização Bling ERP:** Verificação do token OAuth v3 e recebimento dos webhooks de estoque.

---

## 📝 Histórico de Registros

- **Data de Início:** 21/08/2026
- **Status:** Fase de Homologação em Produção Ativada
