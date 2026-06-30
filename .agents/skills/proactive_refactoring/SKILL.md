---
name: Refatoração Proativa e Anti-Monolito
description: Acionado automaticamente sempre que o agente for instruído a editar ou adicionar código em um arquivo grande (monolito) ou blindado (blacklist).
---

# Instruções de Refatoração Proativa

Você deve atuar proativamente contra a formação de monolitos de código, seguindo rigorosamente os protocolos de segurança da PlataformaCard para evitar quebras de layout (Trava Absoluta).

## 1. Gatilho de Ação
- Se a sua tarefa principal exigir que você altere ou adicione código a um arquivo com **mais de 500 linhas**, você DEVE realizar uma refatoração pontual (extração de sub-componente) *antes* ou *junto* com a inserção da nova lógica, aproveitando o contexto aberto.
- Não inicie refatorações aleatórias em arquivos fora do escopo da sua tarefa atual.

## 2. Lidando com a Blacklist (Arquivos Blindados)
De acordo com o `PROTOCOLO_DE_REFATORACAO_DE_MONOLITOS.md`, arquivos críticos como `ProductModal.tsx` e interfaces de Catálogo (ex: `app/p/[slug]/...`) são intocáveis para refatorações estruturais de código legado.
- **Regra de Adição na Blacklist:** Se você precisar adicionar uma NOVA funcionalidade a um arquivo da Blacklist, construa toda a nova lógica/UI em um **arquivo novo** (componente extraído). Em seguida, apenas importe e injete esse componente dentro do arquivo blindado. **É estritamente proibido extrair ou reestruturar o código legado que já existe lá dentro.**

## 3. Validação, Checkpoint (VPGP) e Autonomia
Para garantir máxima segurança sem gargalos manuais, siga o pipeline automatizado ao refatorar:
1. **Checkpoint Automático:** Antes de iniciar o recorte, crie um commit de backup executando `git add .` e `git commit -m "chore(vpgp): ponto de restauracao pre-refatoracao"`.
2. **Trava Absoluta:** Aplique o recorte (cut) cirúrgico. O código JSX e as marcações Tailwind originais devem ser movidos EXATAMENTE como estão, apenas ajustando as importações (props). Não recrie as estruturas HTML.
3. **Autovalidação:** Execute um comando rápido de verificação (ex: build/lint) se for viável. 
4. **Sem Interrupções:** Se a sintaxe estiver correta e livre de erros, você está autorizado a seguir em frente com a tarefa principal autonomamente, sem parar para pedir aprovação visual no browser para o usuário. Só o alerte em caso de erros no terminal.
