# Guia Oficial de Configuração de Infraestrutura de Identidade (Resend SMTP & Domínios Vercel)

Este documento orienta a configuração final de e-mails transacionais e apontamento DNS para o lançamento oficial em produção.

---

## 1. 📧 Configuração de E-mail SMTP (Resend & Supabase Auth)

Para evitar que e-mails de recuperação de senha e códigos OTP de verificação caiam no SPAM (ou sofram com o limite padrão de 50 e-mails/dia do Supabase), integramos o provedor **Resend**.

### A. Obter a API Key no Resend
1. Acesse [resend.com](https://resend.com) e crie/faça login na sua conta.
2. Na aba **API Keys**, clique em **Create API Key**.
3. Copie o token gerado (ex: `re_123456789...`).
4. Adicione no arquivo `.env.local` e nas variáveis da Vercel:
   ```env
   RESEND_API_KEY=re_123456789...
   RESEND_FROM_EMAIL=atendimento@suaempresa.com.br
   ```

### B. Configurar o Custom SMTP no Supabase Auth
1. Acesse o painel do seu projeto no Supabase: [supabase.com/dashboard](https://supabase.com/dashboard).
2. Vá em **Authentication** -> **Email Settings**.
3. Role até a seção **Custom SMTP Server** e ative o switch.
4. Preencha com os dados abaixo:
   - **Sender Email:** `atendimento@suaempresa.com.br` (ou `noreply@suaempresa.com.br`)
   - **Sender Name:** `PlataformaShop`
   - **Host:** `smtp.resend.com`
   - **Port:** `587`
   - **Username:** `resend`
   - **Password:** *[Sua chave RESEND_API_KEY]*
5. Clique em **Save**.

---

## 2. 🌐 Apontamento DNS & Domínios na Vercel

### A. Domínio Principal do SaaS (Go-Live)
No painel da Vercel (**Project Settings** -> **Domains**), adicione o seu domínio principal (ex: `plataformashop.com.br`):

| Tipo | Nome / Host | Valor / Destino | Finalidade |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` | `76.76.21.21` | Apontamento da raiz |
| **CNAME** | `www` | `cname.vercel-dns.com` | Redirecionamento www |

### B. Registros DNS para o Resend (DKIM & SPF)
Para garantir que seus e-mails tenham **100% de entregabilidade** na caixa de entrada do Gmail/Outlook:
1. No painel do Resend, vá em **Domains** -> **Add Domain**.
2. Adicione os 3 registros TXT/MX informados pelo Resend no seu painel DNS (Registro.br, Cloudflare ou GoDaddy):
   - **TXT (DKIM):** `resend._domainkey` -> `p=MIGfMA0GCS...`
   - **TXT (SPF):** `v=spf1 include:amazonses.com ~all`
   - **MX:** `feedback.resend.com`

---

## 🛠️ Módulos e Templates Criados no Repositório

- **Módulo Resend (`lib/email/resend.ts`):** `sendEmail()`, `sendOtpEmail()`, `sendResetPasswordEmail()`.
- **Templates HTML (`lib/email/templates.ts`):** Layouts responsivos Dark Mode testados para e-mails transacionais.
- **Script de Auditoria (`scripts/audit_identity_infrastructure.js`):** Script para verificação instantânea das variáveis de e-mail e domínios.
