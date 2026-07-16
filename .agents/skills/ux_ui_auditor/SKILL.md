---
name: Auditoria UX/UI Proativa
description: Um auditor automático de CSS e Tailwind para garantir layouts em Dark Mode e componentes premium. Deve ser acionado por palavras-chave (UX, UI, implementar) ou protocolo start.
---

# Auditoria UX/UI Proativa

Esta skill foi criada para garantir a conformidade constante com o `PROTOCOLO_DEV_UX_UI.md` durante o desenvolvimento do aplicativo.

## Como funciona?
Sempre que você (IA) receber instruções para modificar UI, ou o usuário usar palavras-chave como **implementar**, **adicionar botão**, **UX**, **UI**, ou acionar o **protocolo start**, você DEVE rodar o script de varredura automatizado desta skill na base de código do dashboard e também verificar visualmente o seu próprio trabalho recém gerado.

## O que deve ser avaliado/corrigido?
1. **Cores estáticas no Dark Mode**: Classes como `bg-white`, `bg-black`, `text-black` (exceto em Landing Pages B2C). O foco principal é limpar a pasta `app/dashboard/` e `components/`.
2. **Arredondamento Padrão**: O app possui cantos arredondados estilo SaaS moderno (`rounded-2xl`, `rounded-xl`).
3. **Glassmorphism**: Aplicação de `backdrop-blur-xl` e `bg-black/50`.

## Ação da Skill
Ao engajar esta skill, você deve rodar o script utilitário contido nesta pasta:

```bash
node .agents/skills/ux_ui_auditor/scripts/audit_ux_ui.js
```

O script fará uma varredura nas pastas `app/dashboard` e `components/dashboard` procurando por infrações críticas (`bg-white` solto, `text-black` solto) que corrompem o dark mode. Após rodar o script, você receberá um relatório sobre as substituições e deverá commitar as correções sugeridas.
