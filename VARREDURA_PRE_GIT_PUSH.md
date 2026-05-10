# Protocolo de Varredura Pré-Git Push (VPGP)

Este protocolo DEVE ser executado integralmente antes de qualquer `git push` para garantir a estabilidade do deploy no Vercel e a coesão visual da plataforma.

## 1. Auditoria de Tipagem (Build Resilience)
- [ ] **Proibição do `any`:** Realizar busca global por `as any` ou `: any` em componentes JSX.
- [ ] **Checks de Nulidade (Null Safety):** Garantir que objetos vindos de `maybeSingle()` (Supabase) ou rascunhos locais usem optional chaining (`?.`) ou tenham checks explícitos antes do acesso a propriedades.
- [ ] **Escopo de Variáveis:** Verificar se variáveis definidas dentro de blocos `try/catch` não estão sendo usadas fora deles sem inicialização prévia no escopo pai.
- [ ] **Unificação de Tipos:** Garantir que tipos com o mesmo nome (ex: `ProductRow`, `Category`) sejam idênticos em todos os arquivos ou exportados de um local central para evitar o erro "Two different types with this name exist".
- [ ] **Sincronização de Interfaces:** Garantir que as interfaces de dados contenham todos os campos retornados pelo banco (ex: `organization_id`, `category_id`).

## 2. Auditoria de Tema (Dark Mode Compliance)
- [ ] **Hardcoded Colors:** Buscar por cores hexadecimais fixas (`#ffffff`, `#000000`) no JSX.
- [ ] **Zinc/White Cleanup:** Buscar por classes Tailwind fixas como `bg-white`, `bg-zinc-50`, `text-zinc-400` e substituí-las pelos tokens:
    - Textos: `var(--dash-text-primary)`, `var(--dash-text-muted)`.
    - Superfícies: `var(--dash-surface)`, `var(--dash-surface-secondary)`.
    - Bordas: `var(--dash-border)`.
    - Inputs: `var(--dash-input-bg)`.

## 3. Protocolo de Navegação (Sidebar & UX)
- [ ] **Ordem dos Menus:** Validar se a ordem segue o protocolo: Dashboard > Empresa > Catálogo > ... > Perfil > Analytics.
- [ ] **Active Indicator:** Garantir que o indicador de 4px Emerald Glow está presente no item ativo.

## 4. Limpeza de Refatoração (Dead Code Scan)
- [ ] **Referências Órfãs:** Ao extrair lógica para Modais, garantir que o componente Pai (ex: `CatalogoClient.tsx`) não tenha sobrado com funções (`handleCopyLastProduct`) ou `setters` de estado que agora pertencem ao filho.
- [ ] **Consistência de Callbacks:** Verificar se a assinatura das funções de callback (`onConfirm`, `onSuccess`) no pai bate exatamente com o que o componente filho espera receber.

## 5. Sincronização SSOT (Fonte Única de Verdade)
- [ ] **Documentação:** Atualizar a Seção 7 (Log de Alterações) do `DOCUMENTATION.md`.
- [ ] **Pendências:** Mover tarefas concluídas para o log e atualizar o status no `continuity_prompt.md`.

---
## 💡 Lições Aprendidas (Post-Mortem de Deploy)

1. **Erros de Escopo:** O Vercel falha se você define uma variável de segurança dentro de um `try` e tenta usá-la no JSX fora dele. Sempre defina a variável com `let` ou `const` fora do bloco.
2. **Conflito de Tipos "Gêmeos":** Dois arquivos com tipos `ProductRow` diferentes causam erro de "unrelated types". A solução é exportar o tipo ou mantê-los 100% idênticos.
3. **Null Safety em Uploads:** O ID de um registro recém-criado pode ser visto como `undefined` pelo TS. Use um check `if (!id) throw error` antes de prosseguir com uploads dependentes desse ID.
4. **Fallback de Perfil:** No Analytics, sempre prever que o `profile` pode falhar no sync e usar o `user.id` como fallback direto para evitar quebra de página.
