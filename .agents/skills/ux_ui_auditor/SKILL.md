---
name: Auditoria UX/UI Proativa
description: Um auditor automático de CSS e Tailwind para garantir layouts em Dark Mode e componentes premium. Deve ser acionado por palavras-chave (UX, UI, implementar) ou protocolo start.
---

# Auditoria UX/UI Proativa

Esta skill foi criada para garantir a conformidade constante com o `PROTOCOLO_DEV_UX_UI.md` durante o desenvolvimento do aplicativo.

## Como funciona?
Sempre que você (IA) receber instruções para modificar UI, ou o usuário usar palavras-chave como **implementar**, **adicionar botão**, **UX**, **UI**, ou acionar o **protocolo start**, você DEVE executar OBRIGATORIAMENTE as etapas abaixo em ordem.

---

## ⚡ PROTOCOLO START — Sequência Obrigatória

Ao receber o comando "protocolo start" (ou variações como "execute o protocolo start"), execute as seguintes etapas **sempre, em ordem, sem pular nenhuma**:

### Etapa 1 — Verificação de Sincronicidade do Repositório
Execute o comando abaixo para verificar se o repositório local está sincronizado com o remoto:

```bash
git fetch origin && git status && git log --oneline -3 && echo "---REMOTE---" && git log --oneline origin/main -3
```

- Se o local estiver **à frente** do remoto: informar ao usuário e perguntar se deseja fazer `git push`.
- Se o remoto estiver **à frente** do local: executar automaticamente `git pull --rebase origin main` e reportar o resultado.
- Se houver **divergência** (ambos com commits únicos): executar `git pull --rebase origin main`, resolver eventuais conflitos e reportar.
- Se estiver **sincronizado**: apenas confirmar ao usuário.

### Etapa 2 — Iniciar o Servidor Local
Verifique se o servidor de desenvolvimento Next.js já está rodando na porta 3000:

```bash
lsof -ti :3000
```

- Se **já estiver rodando**: apenas informar ao usuário que o servidor está ativo em `http://localhost:3000`.
- Se **não estiver rodando**: iniciar automaticamente com:

```bash
npm run dev
```

Aguardar a confirmação `✓ Ready` no log antes de prosseguir.

### Etapa 3 — Auditoria UX/UI
Somente após concluir as etapas 1 e 2, executar o script de varredura:

```bash
node .agents/skills/ux_ui_auditor/scripts/audit_ux_ui.js
```

Após o script, verificar tamanho dos arquivos abertos pelo usuário e acionar a Skill Anti-Monolito se algum ultrapassar 350 linhas.

---

## O que deve ser avaliado/corrigido?
1. **Cores estáticas no Dark Mode**: Classes como `bg-white`, `bg-black`, `text-black` (exceto em Landing Pages B2C). O foco principal é limpar a pasta `app/dashboard/` e `components/`.
2. **Arredondamento Padrão**: O app possui cantos arredondados estilo SaaS moderno (`rounded-[27px]`, `rounded-xl`).
3. **Glassmorphism**: Aplicação de `backdrop-blur-xl` e `bg-black/50`.
4. **Otimização de Espaços (Prevenção de Vazios)**: Quando as sessões (formulários ou cards) possuírem pouco conteúdo e deixarem espaços em branco exagerados (vazios na tela), organize-os em **duas colunas** (ex: `grid grid-cols-1 lg:grid-cols-2`) para manter o padrão de proporção dos contêineres e um visual preenchido e simétrico.

O script fará uma varredura nas pastas `app/dashboard` e `components/dashboard` procurando por infrações críticas (`bg-white` solto, `text-black` solto) que corrompem o dark mode. Após rodar o script, você receberá um relatório sobre as substituições e deverá commitar as correções sugeridas.
