# Protocolo de Deploy (CI/CD Seguro)

Este documento estabelece a regra de ouro para implementação de novas funcionalidades na PlataformaShop enquanto ela está em produção ("no ar"). 

**Regra Absoluta:** NUNCA codifique ou aplique migrações destrutivas diretamente contra o banco de dados de Produção ou diretamente na branch `main`.

---

## Fases do Fluxo de Trabalho (Step-by-Step)

### Fase 1: Preparação e Desenvolvimento Isolado (Local)
1. **Nova Branch:** No seu computador, inicie o desenvolvimento criando uma branch separada (ex: `feature/nome-da-funcionalidade`).
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   ```
2. **Migrações de Banco de Dados:** Todas as alterações estruturais do banco de dados (novas tabelas, colunas, RLS) devem ser obrigatoriamente salvas como arquivos na pasta `supabase/migrations/`.
3. **Homologação:** O seu ambiente local (`.env`) deve apontar para as credenciais do projeto do **Supabase de Homologação (Staging)**. Teste o código e aplique as migrações apenas nesse banco.

### Fase 2: Validação na Nuvem (Staging via Vercel)
4. **Push para o Github:** Envie a sua branch de funcionalidade para o repositório.
   ```bash
   git push origin feature/nome-da-funcionalidade
   ```
5. **Vercel Preview:** A Vercel interceptará o push e criará uma "URL Temporária" (Preview Deployment). Esse link funciona de forma idêntica à plataforma real, mas carrega o código novo em cima da infraestrutura de homologação.
6. **Validação UX/QA:** Navegue pelo link gerado e valide o fluxo de ponta a ponta. Se der algum erro crítico, os clientes de Produção estarão 100% isolados e seguros.

### Fase 3: Lançamento em Produção (Go-Live)
Após aprovar o funcionamento no link da Vercel, execute os passos de lançamento na ordem exata:

7. **Sincronizar Produção (Banco Primeiro):** O banco de Produção deve estar pronto ANTES de o novo código ir ao ar. Execute os arquivos pendentes de `supabase/migrations/` no **Supabase de Produção** (via `supabase db push --db-url <PROD_URL>` ou executando os scripts no SQL Editor web).
8. **Merge de Código (Pull Request):** Mescle o código da branch `feature` para a branch `main` no Github.
9. **Deploy Oficial:** A Vercel detecta a mudança na `main`, compila o código e publica na URL principal. O seu recurso entra no ar conectando perfeitamente com a estrutura do banco já atualizada.

---
*A adoção sistemática deste fluxo previne interrupções (downtime) e corrupção de dados dos clientes ativos na plataforma.*
