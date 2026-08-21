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
| **Painel de Gestão (Dashboard)** | `https://www.plataformashop.com.br/majmobilidade/login` | Portal de login personalizado da Maj Mobilidade para acesso ao Dashboard |
| **Busca Preditiva & Modais** | `https://www.plataformashop.com.br/dashboard` | Acesso rápido aos produtos por Live Search e modais de estoque global |

---

## 🛠️ Checklist Técnico de Ativação

- [x] **Domínio Principal Conectado:** `www.plataformashop.com.br` ativo no Vercel e servindo via SSL.
- [x] **Middleware & Roteamento:** Suporte nativo a `plataformashop` configurado em `middleware.ts`.
- [x] **Slug de Organização Ativo:** Slug `majmobilidade` vinculado à organização `MAJ MOBILIDADE ELÉTRICA` no Supabase (Retornando `HTTP 200 OK` no catálogo público).
- [x] **Compilação e Tipagem:** Projeto auditado e validado com `npx tsc --noEmit` (0 erros).
- [x] **Modal Status 360° do Produto:** Raio-X completo com estoque, Bling, acessos no catálogo e conversas de WhatsApp.
- [x] **Validação de Roteamento Multi-Empresa:** Prefixo `/majmobilidade` forçado em todas as rotas do dashboard.
- [x] **Validação de Login & Acesso ao Dashboard:** Autenticação via Google OAuth com `organization_id` vinculado à Maj Mobilidade.
- [x] **Sincronização Bling ERP:** Integração Bling V3 ativa e recebendo webhooks.
- [ ] **Experimento Comparativo (GPT Nativo vs PlataformaShop):** Fornecimento da chave de API do Bling para aferição empírica no Custom GPT da Maj.

---

## ⚡ Experimento Comparativo (Bling API no GPT vs PlataformaShop)

Para fins de validação técnica, disponibilizou-se a Chave de API v3 do Bling para que a Maj teste a consulta direta via Custom GPT Actions. Este teste evidenciará:

1. **Gargalo de Renovação de Tokens (OAuth 2.0 / API v3):** A API v3 do Bling exige fluxo OAuth dinâmico com expiração de `access_token`. O GPT não mantém backend persistente para *refresh tokens*.
2. **Ausência de Reatividade (Webhooks):** O GPT é um sistema *pull* (só responde quando provocado). Ele não pode receber chamadas passivas do Bling quando um produto esgota.
3. **Estouro de Timeouts & Payload:** Consultas a estoques volumosos estouram o limite de resposta HTTP do ChatGPT.
4. **Interface Gráfica vs Texto:** O GPT retorna texto puro em Markdown, enquanto a PlataformaShop provê painéis executivos com gráficos (Donut, Bar, Sparklines) e modais interativos.

---

## 📝 Histórico de Registros

- **Data de Início:** 21/08/2026
- **Status:** Fase de Homologação em Produção Ativada
