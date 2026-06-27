# 🧼 Protocolo de Descontaminação Acidental

Este protocolo define os passos rápidos e definitivos para limpar e restabelecer o ambiente local caso ocorra uma **contaminação de cookies/sessões** entre o **PlataformaShop** e o **ecclesianapp**.

---

## 🚨 Sinais de Contaminação
Você precisará executar este protocolo se observar:
1. **Loop Infinito**: O navegador fica piscando ou alternando rapidamente entre `/dashboard` e `/entrar`.
2. **Erro `Failed to fetch`**: O console do navegador (`F12`) exibe erros de rede persistentes ao tentar ler tabelas como `profiles`.
3. **Mapeamento de Erro `{}`**: Mensagens no console como `Erro ao carregar perfil no dashboard: {}` ocorrendo repetidamente.
4. **Queda de Sessão Alternada**: Fazer login em um app desloga você automaticamente no outro.

---

## 🛠️ Passo a Passo para Descontaminação

### Passo 01: Limpar o Armazenamento do Navegador (Client-side)
Como os navegadores compartilham cookies de todas as portas sob o domínio `localhost`, precisamos limpar o estado antigo gravado:

1. Acesse o endereço que está apresentando falha (`http://localhost:3000`, `http://127.0.0.1:3000` ou `http://localhost:3001`).
2. Abra as Ferramentas do Desenvolvedor pressionando **F12** (ou `Cmd + Option + I` no Mac).
3. Vá para a aba **Application** (ou *Armazenamento/Aplicativo*).
4. No menu lateral esquerdo, clique no item principal **Storage** (representado por um ícone de banco de dados).
5. No painel da direita, clique no botão **`Clear site data`** (ou *Limpar dados do site*).
6. **Feche a aba** do navegador.

---

### Passo 02: Limpar o Cache do Compilador (Server-side)
Se a página continuar travada em um carregamento infinito mesmo após a limpeza do navegador, o cache do Next.js (Turbopack) no servidor pode ter corrompido durante as falhas de conexão.

1. No terminal do projeto travado, pare o servidor pressionando **`Ctrl + C`**.
2. Remova a pasta oculta de cache rodando o comando:
   ```bash
   rm -rf .next
   ```
3. Reinicie o servidor de desenvolvimento de forma isolada:
   * **Para o PlataformaShop**:
     ```bash
     npm run dev -- -p 3000
     ```
   * **Para o ecclesianapp**:
     ```bash
     npm run dev -- -p 3001
     ```

---

### Passo 03: Reabrir usando Acessos Isolados
Abra uma nova aba (ou uma aba anônima para testar inicialmente) e use os links isolados para impedir novos conflitos:

* **PlataformaShop**: Acesse por **`http://127.0.0.1:3000/entrar`** ou **`http://plataformashop.localhost:3000/entrar`**
* **ecclesianapp**: Acesse por **`http://localhost:3001`** ou **`http://ecclesianapp.localhost:3001`**
