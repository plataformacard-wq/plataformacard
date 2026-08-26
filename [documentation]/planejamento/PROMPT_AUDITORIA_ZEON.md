# 🚀 PROMPT DE CONTINUIDADE: AUDITORIA DO MÓDULO ZEON B2B

> **Como usar:** Copie e cole o texto do bloco abaixo no início da sua próxima sessão para acionar a auditoria completa do Portal B2B.

```markdown
Olá! Vamos realizar a auditoria e validação técnica do Módulo Zeon B2B (PlataformaShop / Maj Mobilidade).

Por favor, siga o roteiro oficial de auditoria disponível em `[documentation]/manuais/PLANO_AUDITORIA_ZEON_B2B.md`:

1. **Protocolo START & Sincronia:**
   - Execute o Protocolo Start (git status, verificação do servidor dev na porta 3000 com `npm run dev` e validação do motor `audit_ux_ui.js`).
   - Confirme a compilação limpa com `npx tsc --noEmit`.

2. **Validação dos Cenários E2E B2B:**
   - **Cenário 1 (Google Sheets):** Testar sincronização de planilha pública por SKU no Dashboard `/dashboard/b2b` (Aba Google Sheets).
   - **Cenário 2 (Convite Direto Outbound):** Criar cliente B2B no Dashboard com Tabela Y ➔ Copiar link `?b2b=TOKEN` ➔ Abrir em janela anônima e validar exibição da Tabela Y no catálogo `/majmobilidade`.
   - **Cenário 3 (Solicitação Inbound):** No catálogo `/majmobilidade`, simular *"Quero ser Revendedor"* ➔ Validar tela de retenção *"Preparando ofertas..."* ➔ Aprovar solicitação no Dashboard definindo Tabela Z e disparar WhatsApp.
   - **Cenário 4 (Pedido em Lote & Bling ERP v3):** Como cliente B2B logado, abrir *"Pedido em Lote B2B"*, selecionar quantidades, finalizar pedido e validar registro no Supabase e envio do Pedido de Venda para a API v3 do Bling.

Me forneça um relatório detalhado de cada cenário executado.
```
