---
name: Refatoração Proativa e Anti-Monolito
description: ACIONAR SEMPRE que editar, modificar ou adicionar código em arquivos muito grandes (> 350 linhas), arquivos monolíticos, ou arquivos blindados na blacklist (como ProductModal.tsx e page.tsx).
---

# Instruções de Refatoração Proativa

Você deve atuar ativamente no monitoramento e combate à formação de monolitos de código, garantindo que a arquitetura se mantenha saudável.

## 1. Gatilho de Ação (PAUSA OBRIGATÓRIA)
- Se a sua tarefa principal exigir que você altere, leia ou adicione código a um arquivo com **mais de 350 linhas**, você DEVE **PAUSAR** a execução da tarefa atual imediatamente.
- Alerte o usuário de que um Monolito foi detectado e que a refatoração/quebra desse arquivo é recomendada antes de prosseguir com novas funcionalidades.
- Proponha um plano de resolução (ex: extração de quais sub-componentes) e pergunte se o usuário deseja prosseguir com a refatoração agora ou se prefere ignorar o aviso por enquanto.

## 2. Lidando com a Blacklist (Arquivos Blindados)
Arquivos críticos como `ProductModal.tsx` e interfaces de Catálogo (ex: `app/[slug]/page.tsx`) são intocáveis para refatorações estruturais de código legado profundo.
- **Regra de Adição na Blacklist:** Ao propor um plano de refatoração para um arquivo blindado, deixe claro que você só irá extrair as NOVAS lógicas ou componentes em arquivos separados e chamá-los, mantendo o legado existente intacto. É estritamente proibido extrair ou reestruturar o código legado que já existe lá dentro.

## 3. Padrão de Refatoração (Após Aprovação)
Se o usuário autorizar a resolução do monolito:
1. **Checkpoint Automático:** Crie um commit de backup executando `git add .` e `git commit -m "chore: ponto de restauracao pre-refatoracao"`.
2. **Trava Absoluta:** Aplique o recorte (cut) cirúrgico. O código JSX e as marcações Tailwind originais devem ser movidos EXATAMENTE como estão.
3. **Autovalidação:** Execute `npm run build` para validar a quebra.
4. Após o sucesso, retome a tarefa original que havia sido pausada.
