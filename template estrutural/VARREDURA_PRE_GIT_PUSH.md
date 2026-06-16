# Protocolo de Varredura Pré-Git Push (VPGP)

Este protocolo DEVE ser executado integralmente antes de realizar qualquer `git push` no repositório para evitar quebras de build em ambiente de produção (Vercel/Netlify) e falhas no banco.

---

## 1. Auditoria de Tipagem (TypeScript)
- [ ] **Sem cast `any`:** Fazer busca global por `as any` ou `: any`. Garantir que as propriedades e retornos das queries do Supabase estejam tipados corretamente.
- [ ] **Optional Chaining:** Verificar se dados vindos de fetches do Supabase utilizam `?.` nos campos opcionais para evitar erros de renderização em cascata (Null Pointer).
- [ ] **Tratamento de Rich Text:** Garantir que todo conteúdo inserido como HTML (ex: descrição de avisos que vêm do Rich Text Editor da secretaria) passe por uma função de sanitização antes de usar o `dangerouslySetInnerHTML`.

## 2. Acessibilidade e Estilo (Mobile PWA)
- [ ] **Contraste de Inputs:** Verificar se campos de texto de formulários (como pedidos de intenção ou doação) possuem cores sólidas de fundo e texto legível, sem depender da cascata instável de temas transparentes.
- [ ] **Margens de Toque:** Garantir que botões no mobile (especialmente na visualização do PWA do fiel) possuam área mínima de clique de `44px` para atender usuários de todas as idades.

## 3. Build & Envio
- [ ] Rodar o build de produção localmente antes de comitar:
  ```bash
  npm run build
  ```
- [ ] Se compilado com sucesso, execute o envio:
  ```bash
  git add .
  git commit -m "feat/fix: descrição sucinta da alteração"
  git push origin main
  ```
