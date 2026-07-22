# 🚀 Guia de Transição: Ambiente Local (localhost:3000) → Produção Online

Este documento fornece o checklist completo e o passo a passo técnico para migrar a **PlataformaShop** de `http://localhost:3000` para o ambiente online de produção (Vercel / Supabase / Kiwify / Google OAuth).

---

## 🔍 1. Relatório da Varredura de Código (`localhost:3000`)

A varredura realizada no código-fonte identificou os seguintes pontos de atenção:

### A. Lógica Dinâmica em `middleware.ts`
- O arquivo `middleware.ts` foi construído com suporte a múltiplos ambientes (`isLocalhost`, `isVercel`, `isMainDomain`).
- **Ação em Produção:** Garantir que o nome do seu domínio principal (ex: `plataformashop.com.br` ou `anotameucontato.com.br`) esteja listado no array `isMainDomain` em `middleware.ts`.

### B. Variáveis de Ambiente do Next.js
- Nenhuma URL `http://localhost:3000` está fixada no código dos componentes front-end.
- O projeto consome URLs relativas e rotas dinâmicas do Next.js.

---

## 🛠️ 2. Checklist de Configuração para Produção (Vercel & Supabase)

### Passo 1: Variáveis de Ambiente na Vercel
Acesse o painel da Vercel (`Project Settings -> Environment Variables`) e configure:

```env
# 🟢 Domínio Oficial do App
NEXT_PUBLIC_APP_URL=https://seudominio.com.br
NEXT_PUBLIC_SITE_URL=https://seudominio.com.br

# 🟢 Credenciais do Supabase de Produção
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_de_producao
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_de_producao

# 🟢 Webhook & Integração Kiwify
KIWIFY_WEBHOOK_SECRET=seu_token_secreto_webhook_kiwify
```

---

### Passo 2: Supabase Auth (Configuração de Redirect URLs)
No painel do Supabase (`Authentication -> URL Configuration`):

1. **Site URL:**
   Setar para: `https://seudominio.com.br`

2. **Redirect URLs (URLs permitidas de redirecionamento):**
   Adicionar:
   - `https://seudominio.com.br/**`
   - `https://*.vercel.app/**`
   - `https://seudominio.com.br/api/auth/callback`
   - `https://seudominio.com.br/dashboard`

---

### Passo 3: Webhook Comercial Kiwify
No painel da Kiwify (`Configurações da Conta / Apps -> Webhooks`):

1. Substitua qualquer URL de teste local ou ngrok por:
   - **URL de Produção:** `https://seudominio.com.br/api/webhooks/kiwify`
2. Marque os eventos ativos:
   - `order_approved` (Venda aprovada / Liberação de plano)
   - `subscription_renewed` (Renovação de assinatura)
   - `subscription_canceled` ou `chargeback` (Bloqueio / Cancelamento)

---

### Passo 4: Google OAuth 2.0 (Login Social)
No [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **Origens JavaScript Autorizadas:**
   - `https://seudominio.com.br`
   - `https://<seu-app>.vercel.app`

2. **URIs de Redirecionamento Autorizados:**
   - `https://<seu-projeto-supabase>.supabase.co/auth/v1/callback`

---

### Passo 5: Migrações SQL e Banco de Dados
Certifique-se de executar as últimas migrações SQL no editor do Supabase de produção:

1. `20260721211000_update_plans_3_tiers.sql`
2. `20260722_add_mfa_backup_codes.sql`

---

## ⚡ 3. Sequência de Validação Pós-Deploy

Após publicar o projeto na Vercel:

1. ✅ Acessar `https://seudominio.com.br` e verificar a renderização da Landing Page e Tabela de Planos.
2. ✅ Testar o botão "Assinar Agora" de um plano para validar o redirecionamento para `https://seudominio.com.br/checkout?plan=pro&cycle=annual`.
3. ✅ Efetuar um login de teste em `https://seudominio.com.br/entrar`.
4. ✅ Testar a simulação de compra no webhook `/api/webhooks/kiwify`.
