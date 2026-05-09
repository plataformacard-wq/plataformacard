# Protocolo de Varredura Pré-Git Push (VPGP)

Este protocolo DEVE ser executado integralmente antes de qualquer `git push` para garantir a estabilidade do deploy no Vercel e a coesão visual da plataforma.

## 1. Auditoria de Tipagem (Build Resilience)
- [ ] **Proibição do `any`:** Realizar busca global por `as any` ou `: any` em componentes JSX.
- [ ] **Sincronização de Interfaces:** Garantir que as interfaces de dados (ex: `ProductRow`) contenham todos os campos retornados pelo Supabase.
- [ ] **Build Check:** Se possível, rodar `npm run build` localmente para validar tipos.

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

## 4. Sincronização SSOT (Fonte Única de Verdade)
- [ ] **Documentação:** Atualizar a Seção 7 (Log de Alterações) do `DOCUMENTATION.md`.
- [ ] **Pendências:** Mover tarefas concluídas para o log e atualizar o status no `continuity_prompt.md`.

---
*Este documento é a regra de ouro para estabilidade do projeto.*
