# Protocolo de Varredura Pré-Git Push (VPGP)

Este protocolo DEVE ser executado integralmente antes de qualquer `git push` para garantir a estabilidade do deploy no Vercel e a coesão visual da plataforma.

## 1. Auditoria de Tipagem (Build Resilience)
- [x] **Proibição do `any`:** Realizar busca global por `as any` ou `: any` em componentes JSX. (Limpeza realizada no ProductCatalogClient).
- [x] **Checks de Nulidade (Null Safety):** Garantir que objetos vindos de `maybeSingle()` ou rascunhos usem optional chaining (`?.`). (OK em Destaques e IA).
- [x] **Escopo de Variáveis:** Verificar se variáveis dentro de blocos `try/catch` não estão sendo usadas fora deles. (Verificado: variáveis como userId e outras declaradas fora dos blocos com let).
- [x] **Unificação de Tipos:** Garantir que tipos com o mesmo nome sejam idênticos. (OK em ProductRow).
- [x] **Sincronização de Interfaces:** Garantir que as interfaces contenham todos os campos retornados pelo banco. (OK).

## 2. Auditoria de Tema (Dark Mode Compliance)
- [x] **Hardcoded Colors:** Buscar por cores hexadecimais fixas no JSX. (Limpeza concluída no ProductCatalogClient).
- [x] **Zinc/White Cleanup:** Buscar por classes Tailwind fixas como `bg-white`, `bg-zinc-50`. (OK).

## 3. Protocolo de Navegação (Sidebar & UX)
- [x] **Ordem dos Menus:** Validar se a ordem segue o protocolo específico do Super Admin. (OK: Empresas > Cartões > Vitrines > CaaS > Recursos).
- [x] **Active Indicator:** Garantir que o indicador de 4px Emerald Glow está presente no item ativo. (OK).

## 4. Limpeza de Refatoração (Dead Code Scan)
- [x] **Referências Órfãs:** Garantir que o componente Pai não tenha sobrado com funções que agora pertencem ao filho. (OK).
- [x] **Código Obsoleto:** Removido `AiAssistButton.tsx` e funções depreciadas em `ai-actions.ts`. (OK).
- [x] **Consistência de Callbacks:** Verificar se a assinatura das funções de callback bate exatamente. (OK).

## 5. Sincronização SSOT (Fonte Única de Verdade)
- [x] **Documentação:** Atualizar a Seção 7 do `DOCUMENTATION.md`. (OK).
- [x] **Pendências:** Mover tarefas concluídas para o log. (OK).

---
## 💡 Lições Aprendidas (Post-Mortem de Deploy)

1. **Erros de Escopo:** O Vercel falha se você define uma variável de segurança dentro de um `try` e tenta usá-la no JSX fora dele. Sempre defina a variável com `let` ou `const` fora do bloco.
2. **Conflito de Tipos "Gêmeos":** Dois arquivos com tipos `ProductRow` diferentes causam erro de "unrelated types". A solução é exportar o tipo ou mantê-los 100% idênticos.
3. **Null Safety em Uploads:** O ID de um registro recém-criado pode ser visto como `undefined` pelo TS. Use um check `if (!id) throw error` antes de prosseguir com uploads dependentes desse ID.
4. **Fallback de Perfil:** No Analytics, sempre prever que o `profile` pode falhar no sync e usar o `user.id` como fallback direto para evitar quebra de página.

---

## 🚀 Execução Final
Após validar todos os itens acima e garantir que o build local (`npm run build`) está passando, execute o envio definitivo:

```bash
git add .
git commit -m "feat/fix: descrição sucinta da entrega"
git push origin main
```
