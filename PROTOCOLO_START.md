# 🟢 Protocolo Start

Este documento define as diretrizes obrigatórias que o agente de IA deve executar sempre que o usuário iniciar uma nova sessão ou solicitar explicitamente a execução do **"Protocolo Start"**.

---

## 🛠️ Fluxo de Execução Obrigatório

Quando este protocolo for acionado, o agente deve seguir rigorosamente a seguinte ordem de passos:

### 01. Iniciar o Servidor Local de Desenvolvimento
Antes de qualquer outra verificação ou análise, o agente deve garantir que o servidor de desenvolvimento local está rodando.
* **Ação**: Executar o comando `npm run dev` em segundo plano (especificando a porta `-p 3000` se necessário para isolamento).
* **Verificação**: Confirmar que o processo foi iniciado com sucesso.
* **Link de Acesso Local (Isolado)**: [http://127.0.0.1:3000](http://127.0.0.1:3000)

---

### 02. Verificar Sincronização Git (Local vs. Online)
O agente deve verificar a sincronização do repositório local com o repositório remoto para evitar conflitos de código ou perda de trabalho.

1. **Executar Verificação**:
   * Rodar um `git fetch` em segundo plano para obter o estado mais recente do servidor sem alterar os arquivos locais.
   * Rodar um `git status` ou comparar o commit local com a branch de upstream (`git status -uno` ou similar).
2. **Critério Crítico**:
   * **Se houver atualizações pendentes no remoto (atrás do remoto):** O agente deve informar a quantidade/detalhes dos commits remotos pendentes e perguntar: *"Deseja fazer o **git pull** para atualizar seu repositório local?"*.
   * **Se houver commits locais pendentes de envio (à frente do remoto):** O agente deve informar sobre os commits locais e perguntar: *"Deseja fazer o **git push** para subir as alterações locais?"*.
   * **Se houver arquivos modificados localmente não comitados:** O agente deve listar os arquivos modificados e perguntar qual ação tomar.
   * **Se estiver 100% sincronizado:** Informar que o repositório está atualizado e prosseguir.

---

### 03. Análise de Continuidade da Sessão Anterior
Após garantir a sincronização do repositório, o agente deve mapear o contexto exato de onde o desenvolvimento parou.

1. **Identificar Arquivos Afetados**:
   * Rodar `git log -n 3 --stat` para ver quais foram os últimos arquivos alterados e comitados na sessão recente.
   * Se aplicável, olhar o status do repositório para ver quais arquivos foram editados recentemente.
2. **Consultar Fontes de Contexto**:
   * Ler e analisar o arquivo [PROMPT_DE_CONTINUIDADE.md](file:///Users/macstudio-maj/Documents/Desenvolvimento/Aplicativos/PlataformaCard/PROMPT_DE_CONTINUIDADE.md) para capturar o contexto de negócios, bugs resolvidos recentes e o próximo passo imediato sugerido.
   * Analisar o arquivo [PENDENCIAS.md](file:///Users/macstudio-maj/Documents/Desenvolvimento/Aplicativos/PlataformaCard/PENDENCIAS.md) para cruzar os próximos passos com a lista global de pendências urgentes e bloqueadoras de lançamento.
3. **Apresentar Diagnóstico e Sugestão**:
   * Apresentar um resumo claro de onde o projeto parou.
   * Sugerir de 1 a 3 caminhos lógicos imediatos de continuidade com base no que leu, pedindo a confirmação do usuário.

---

## 📝 Como Acionar este Protocolo
Para ativar este protocolo, o usuário só precisa enviar a mensagem:
> *"Executar o protocolo start"*
