# 🟢 Protocolo de Inicialização - Casa Digital

Este documento define as diretrizes obrigatórias que o agente de IA deve executar sempre que o usuário iniciar uma nova sessão ou solicitar explicitamente o "Protocolo de Inicialização".

---

## 🛠️ Fluxo de Execução Obrigatório

### 01. Iniciar o Servidor Local de Desenvolvimento
Antes de qualquer análise ou escrita de código, garanta que o servidor local está rodando em segundo plano.
* **Ação**: Executar `npm run dev` em segundo plano.
* **Verificação**: Confirmar que o processo subiu com sucesso na porta `3000`.

### 02. Verificar Sincronização Git (Local vs. Online)
Garanta a consistência do código antes de iniciar modificações:
1. Rodar `git fetch` em segundo plano para capturar o estado remoto.
2. Comparar o estado local com o remoto (`git status`):
   * **Se houver commits pendentes no remoto:** Perguntar se deseja executar `git pull`.
   * **Se houver modificações locais não salvas:** Listar os arquivos e solicitar instrução.
   * **Se estiver atualizado:** Informar e prosseguir.

### 03. Análise de Continuidade do Projeto
Mapear o contexto de desenvolvimento da sessão anterior:
1. Executar `git log -n 3 --stat` para revisar os últimos arquivos modificados e commits aplicados.
2. Ler os arquivos `PROMPT_DE_CONTINUIDADE.md` e `PENDENCIAS.md` para cruzar o status técnico atual e propor os próximos 3 caminhos possíveis de desenvolvimento.
