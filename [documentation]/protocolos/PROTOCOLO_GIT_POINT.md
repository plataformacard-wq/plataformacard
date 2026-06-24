# 🛡️ Protocolo Git Point

Este documento define as diretrizes obrigatórias e ações automatizadas que o agente de IA deve executar sempre que o usuário solicitar a criação de um ponto de restauração, "git point", ou invocar o comando **"Executar protocolo git point"**.

O objetivo deste protocolo é garantir que o estado atual do código seja salvo de forma segura e rastreável, permitindo um retorno rápido caso as próximas alterações não saiam como esperado, evitando perda de trabalho e retrabalho.

---

## 🛠️ Fluxo de Execução Obrigatório

Quando este protocolo for acionado, o agente deve seguir rigorosamente os passos abaixo:

### 01. Analisar o Estado Atual (Git Status)
O agente deve verificar se existem modificações pendentes no diretório de trabalho:
* **Comando**: `git status`
* **Se o diretório estiver limpo**:
  * O ponto de restauração será simplesmente uma nova tag/branch a partir do commit atual.
* **Se houver arquivos modificados (unstaged ou staged)**:
  * O agente deve listar os arquivos e perguntar ao usuário:
    1. *(Recomendado)* **Criar um commit temporário de checkpoint** com as alterações atuais.
    2. **Fazer o stash** (guardar temporariamente na pilha do git) das alterações antes de criar o ponto de restauração.
    3. **Descartar as alterações locais** e voltar para o último commit limpo.

---

### 02. Criar a Tag de Restauração (Restore Point Tag)
O agente deve criar uma tag Git única e descritiva no commit base.
* **Nome padrão da Tag**: `restore-point-YYYYMMDD-HHMMSS` (substituindo pela data/hora local atual, ex: `restore-point-20260615-152614`).
* **Comando**:
  ```bash
  git tag -a restore-point-YYYYMMDD-HHMMSS -m "Ponto de restauração antes de iniciar novas alterações"
  ```

---

### 03. Criar uma Branch de Trabalho Dedicada (Se solicitado)
Se o usuário estiver iniciando uma nova funcionalidade, o agente deve criar uma nova branch a partir do ponto de restauração para isolar o desenvolvimento:
* **Nome da Branch**: `feature/[nome-do-recurso]` ou `checkpoint/[nome-do-recurso]`.
* **Comando**:
  ```bash
  git checkout -b [nome-da-branch]
  ```

---

### 04. Registrar e Explicar os Comandos de Reversão
O agente deve listar de forma resumida e amigável:
* O hash do commit de ancoragem.
* A tag criada.
* Os comandos exatos para voltar no tempo caso algo dê errado, ex:
  ```bash
  # Descartar alterações atuais e voltar para a tag
  git reset --hard restore-point-YYYYMMDD-HHMMSS
  ```

---

## 📝 Como Acionar este Protocolo
Para ativar este protocolo, o usuário só precisa enviar a mensagem:
> *"Executar protocolo git point"* ou *"Criar ponto de restauração"*
