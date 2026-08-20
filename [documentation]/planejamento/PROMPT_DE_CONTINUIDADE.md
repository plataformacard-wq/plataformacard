# PROMPT DE CONTINUIDADE - PLATAFORMASHOP

Este documento é a **Fonte Única de Verdade (SSOT)** para encerramento e retomada de sessão de desenvolvimento.

---

## 1. Status das Entregas Concluídas

- [x] **Protocolo START & Auditoria UX/UI:**
  - `git fetch` & status validados. Repositório 100% sincronizado com `origin/main`.
  - Servidor Next.js dev ativo em `http://localhost:3000`.
  - Executado o script `audit_ux_ui.js` corrigindo automaticamente **306 infrações de Dark Mode** em 67 arquivos.
- [x] **Refatoração Anti-Monolito de Estoque:**
  - [StockIntelligenceSection.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/StockIntelligenceSection.tsx) reduzido de 522 para **244 linhas** (redução de 53%).
  - Criados os sub-componentes modulares de cards: [StockTotalCard.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/stock-intelligence/StockTotalCard.tsx), [StockLowCard.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/stock-intelligence/StockLowCard.tsx), [StockOutOfStockCard.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/stock-intelligence/StockOutOfStockCard.tsx) e [StockCategoriesCard.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/stock-intelligence/StockCategoriesCard.tsx).
- [x] **Gateway de Pagamento Kiwify & Sandbox:**
  - Webhook unificado em [/api/webhooks/kiwify](file:///c:/Users/Start/PlataformaShop/app/api/webhooks/kiwify/route.ts) com validação HMAC-SHA1, extração de `org_id` (`s1`/`custom_variables`), ativação de planos (`starter`, `pro`, `sales_team`, `all_service`) e tratamento de estornos/cancelamentos.
  - Checkout Client com repasse de `org_id` nos links da Kiwify.
  - Endpoint de teste Sandbox em `/api/webhooks/kiwify/test` e checkout de simulação instantânea em `/sandbox-checkout/[plan_id]`.
  - Migration SQL `20260820000000_add_subscription_status_to_organizations.sql` com fallback de banco.
- [x] **Autenticação de Dois Fatores (2FA / MFA via TOTP):**
  - Trava de segurança no layout do Portal Main Admin ([app/main/layout.tsx](file:///c:/Users/Start/PlataformaShop/app/main/layout.tsx)) e no login ([app/main-login/page.tsx](file:///c:/Users/Start/PlataformaShop/app/main-login/page.tsx)) forçando 2FA TOTP e desafio AAL2 para `main_admin`.
  - Redirecionamento limpo para `/dashboard/perfil?mfa_required=true` com banner de alerta vermelho/âmbar e abertura automática do modal de cadastro do Google Authenticator/Authy.
  - Geração e salvamento de 8 códigos de backup criptografados em SHA-256 no banco Supabase.
  - Alerta educativo sutil no Dashboard ([DashboardAlerts.tsx](file:///c:/Users/Start/PlataformaShop/components/dashboard/home/DashboardAlerts.tsx)).
- [x] **Infraestrutura de Identidade (Resend SMTP & Domínios Vercel):**
  - Módulo transacional de e-mails ([lib/email/resend.ts](file:///c:/Users/Start/PlataformaShop/lib/email/resend.ts)) e templates HTML responsivos Dark Mode/Emerald ([lib/email/templates.ts](file:///c:/Users/Start/PlataformaShop/lib/email/templates.ts)).
  - Script executável de auditoria de chaves ([scripts/audit_identity_infrastructure.js](file:///c:/Users/Start/PlataformaShop/scripts/audit_identity_infrastructure.js)).
  - Guia completo de parametrização DNS/Resend SMTP em [[documentation]/infraestrutura/GUIA_CONFIGURACAO_DOMINIO_SMTP.md](file:///c:/Users/Start/PlataformaShop/%5Bdocumentation%5D/infraestrutura/GUIA_CONFIGURACAO_DOMINIO_SMTP.md).
- [x] **Protocolo VPGP (Verify, Push, Github, Push):**
  - `npx tsc --noEmit` executado com **0 erros**.
  - `npm run build` executado com sucesso (56/56 páginas estáticas compiladas).
  - Commits e push realizados na branch `main` (`3fc8f35`).

---

## 2. Próximos Passos (Backlog de Lançamento)

1. **Assets Visuais & Mockups 16:9 da Landing Page (LP):**
   - Gerar e aplicar mockups 16:9 em alta definição para o aplicativo, cartão NFC físico, Sincronização Bling ERP V3, NFC Híbrido e Embed em iFrame.
2. **Gestão de Acessos & Permissões de Vendedores B2B:**
   - Validar a granularidade de permissões para a equipe de vendas cadastrada pelos gestores no painel `/dashboard/vendedores`.

---

## 3. Prompt de Retomada para Copiar na Próxima Sessão

```text
Olá! Estou retomando o desenvolvimento da PlataformaShop. Na última sessão, concluímos o Gateway Kiwify com Webhook, a refatoração do estoque, a Autenticação de Dois Fatores (2FA/MFA TOTP) e a Infraestrutura de Identidade (Resend SMTP).

Por favor, execute o Protocolo START (git status, dev server na porta 3000, tsc check e auditoria UX/UI) e vamos avançar com a geração e aplicação dos Mockups Widescreen 16:9 da Landing Page ou a Gestão de Acessos de Vendedores B2B.
```
