# Protocolo de Deploy e Lançamento (Go-Live Seguro)

Este documento estabelece as regras obrigatórias para publicação do **PlataformaShop** em produção ("no ar"). 

**Gatilhos de Execução Automática:** Este protocolo é acionado quando o usuário envia mensagens como:
- *"Vamos colocar no ar"*
- *"Vamos migrar para o local online definitivo"*
- *"Subir para produção / Deploy oficial"*

---

## 🛡️ Trava de Segurança Pré-Lançamento (Obrigatória)

Nenhum deploy para produção é autorizado sem que a IA/desenvolvedor execute a seguinte checklist de validação:

### 1. Varredura de Banco de Dados (Supabase RLS)
Executar o script de auditoria de migrações:
```bash
node scripts/audit_security_rls.js
```
*Critério de Aprovação:* 0 vulnerabilidades ou tabelas sem RLS.

### 2. Auditoria de Dependências
Executar a varredura de segurança das bibliotecas instaladas:
```bash
npm audit
```
*Critério de Aprovação:* Nenhuma vulnerabilidade crítica ou de alta severidade nas dependências ativas.

### 3. Validação de Variáveis de Ambiente em Produção (Vercel)
Verificar se todas as chaves secretas de produção estão devidamente configuradas:
- `SUPABASE_SERVICE_ROLE_KEY`
- `KIWIFY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`

### 4. Ativação do Escudo Cloudflare (WAF / Anti-DDoS)
1. Apontar o DNS do domínio definitivo (Registro.br/GoDaddy) para a Cloudflare.
2. Ativar o Proxy da Cloudflare (Nuvem Laranja) para os registros A/CNAME apontando para a Vercel.
3. Configurar SSL/TLS no modo **Full (Strict)**.
4. Habilitar o *Bot Fight Mode* no WAF da Cloudflare.

### 5. Compilação Limpa (Zero Type Errors)
Executar compilação local prévia:
```bash
npm run build
```
*Critério de Aprovação:* Build concluído com sucesso (`✓ Compiled successfully`).

---

## Fases do Fluxo de Trabalho (Step-by-Step)

### Fase 1: Preparação e Desenvolvimento Isolado (Local)
1. **Nova Branch:** No seu computador, inicie o desenvolvimento criando uma branch separada (ex: `feature/nome-da-funcionalidade`).
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   ```
2. **Migrações de Banco de Dados:** Todas as alterações estruturais (novas tabelas, colunas, RLS) devem ser salvas como arquivos em `supabase/migrations/`.
3. **Homologação:** O seu ambiente local (`.env`) deve apontar para as credenciais do **Supabase de Homologação (Staging)**.

### Fase 2: Validação na Nuvem (Staging via Vercel)
4. **Push para o Github:** Envie a branch para o repositório.
   ```bash
   git push origin feature/nome-da-funcionalidade
   ```
5. **Vercel Preview:** Valide o funcionamento no link temporário gerado pela Vercel.

### Fase 3: Lançamento em Produção (Go-Live)
Após a aprovação da checklist de segurança pré-lançamento:

6. **Migrações no Banco de Produção:** Aplicar os arquivos de `supabase/migrations/` no Supabase de Produção.
7. **Merge na Main:** Mesclar a branch `feature` para a branch `main` no Github.
8. **Deploy Oficial na Vercel:** A Vercel publica automaticamente a nova versão sob o escudo da Cloudflare.
