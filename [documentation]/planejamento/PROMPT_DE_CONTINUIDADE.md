# 🟩 PROMPT DE CONTINUIDADE: Sincronização Kiwify, Ancoragem Dupla por Ciclo e Selos de Segurança

**Data:** 22/07/2026

---

## 📌 Contexto da Sessão Concluída:
Nesta sessão, concluímos a integração comercial com a Kiwify, o desacoplamento de preços e ancoragem no CMS e a segurança do checkout:

1. **Selos de Segurança no Checkout (`SecurityBadges.tsx`):**
   - Criado componente com badges de Criptografia SSL 256-Bit, PCI-DSS Level 1, Garantia de Reembolso de 7 Dias e Acesso Imediato.
   - Ícones visuais para Pix Instantâneo, cartões Visa/Mastercard/Elo e homologação Kiwify.

2. **Mapeamento de Checkouts Reais da Kiwify (`lib/plans/feature-matrix.ts`):**
   - Mapeados os 6 links oficiais da Kiwify para todos os planos e ciclos:
     - Starter Mensal (`o58QqJP`) / Starter Anual (`JYPy0Ec`)
     - PRO Mensal (`exQ3L5T`) / PRO Anual (`H8G4uuU`)
     - Sales Team Mensal (`LkBViNa`) / Sales Team Anual (`DcSyq23`)
   - Redirecionamento automático com pré-preenchimento dos dados do comprador.

3. **Desacoplamento de Preço de Cobrança vs. Ancoragem Riscada (CMS):**
   - Preço cobrado Kiwify blindado na matriz oficial (`monthlyPrice` / `annualPrice`).
   - Dois campos de ancoragem riscada independentes no modal do CMS: **ÂNCORA DO CICLO MENSAL** e **ÂNCORA DO CICLO ANUAL**.
   - Preview Matemático & Gatilho de Ancoragem dinâmico no modal do CMS com cálculo instantâneo de desconto mensal (`OFF/mês`) e economia anual acumulada.

4. **Protocolo VPGP e Auditoria UX/UI:**
   - Varredura de UX/UI com 232 correções automáticas aplicadas.
   - `npx tsc --noEmit` validado com 0 erros.
   - Staging, commit e push executados com sucesso para a branch `main`.

---

## 🔗 Links para Testes (`http://localhost:3000`):
- **Landing Page (Tabela de Preços & Ancoragem):** http://localhost:3000/#planos
- **Checkout PRO Anual Kiwify:** http://localhost:3000/checkout?plan=pro&cycle=annual
- **Checkout Starter Mensal Kiwify:** http://localhost:3000/checkout?plan=starter&cycle=monthly
- **Painel CMS Admin (Gestão de Planos & Ancoragem):** http://localhost:3000/main/landing-page

---

## 📋 PROMPT PARA COPIAR E COLAR NA PRÓXIMA SESSÃO:

```markdown
<CONTEXTO_DE_CONTINUIDADE>
Concluímos a integração comercial da Kiwify, o desacoplamento de preços e o sistema de ancoragem dupla por ciclo no CMS da PlataformaShop.

*Resumo das Entregas Ativas:*
1. **Sincronização Kiwify & Checkouts:**
   - 6 links reais da Kiwify mapeados em `lib/plans/feature-matrix.ts` com redirecionamento e pré-preenchimento dos dados do assinante.
   - Webhook `/api/webhooks/kiwify` configurado para liberação automática.
2. **Selos de Segurança (`SecurityBadges.tsx`):**
   - Badges de SSL 256-bit, PCI-DSS Level 1, Garantia de 7 Dias e selos de pagamento integrados ao `/checkout`.
3. **Ancoragem Dupla por Ciclo & Blindagem Kiwify (CMS):**
   - Preços de cobrança Kiwify trancados e protegidos contra divergências.
   - Campos de ancoragem riscada independentes para Ciclo Mensal e Ciclo Anual no modal "Editar Plano" (`PlansTable.tsx`).
   - Preview Matemático dinâmico recalculando descontos em tempo real.
4. **VPGP & Build:**
   - Compilação TypeScript `npx tsc --noEmit` com 0 erros, código enviado para o GitHub (`git push origin main`).

*Objetivo da Nova Sessão:*
Executar o Protocolo Start, realizar a auditoria completa do sistema de ancoragem e preços Kiwify na Landing Page/CMS e avançar para o plano de Autenticação de Dois Fatores (2FA/MFA via TOTP).
</CONTEXTO_DE_CONTINUIDADE>
```
