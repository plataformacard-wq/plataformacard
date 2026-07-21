# Regras de Customização da PlataformaShop

## Regra de Padding para Menus Dropdown (Selects)
Ao criar ou modificar elementos HTML `<select>` estilizados com Tailwind CSS, **SEMPRE** garanta um padding maior à direita para evitar que o ícone de seta nativo do navegador fique colado ou sobreponha o texto.

- **NÃO FAÇA:** Usar paddings simétricos horizontais como `px-3` ou `px-4`, e deixar o `<select>` sem `appearance-none` (o Safari ignora o padding).
- **FAÇA:** Adicione a classe `.dash-select` (definida em `globals.css`) que já aplica `appearance-none`, a setinha SVG customizada e o `padding-right` de 2.5rem (`pr-10`). Use apenas o padding esquerdo (`pl-3` ou `pl-4`).
- **Exemplo Incorreto:** `className="rounded-lg border px-3 py-1.5"`
- **Exemplo Correto:** `className="dash-select rounded-lg border pl-3 py-1.5"`

## Protocolo VPGP (Verify, Push, Github, Push)
Sempre que o usuário requisitar a execução do "Protocolo VPGP" para salvar as alterações, certifique-se OBRIGATORIAMENTE de compilar o projeto antes de fazer o commit/push, a fim de evitar que erros estritos do TypeScript cheguem até a Vercel. Siga os passos:
1. **Validar (Build):** Execute `npm run build` ou `npx tsc --noEmit` localmente.
2. **Corrigir:** Se a compilação acusar algum erro de tipagem (`Type error`), corrija o código imediatamente e rode o build novamente até passar sem falhas.
3. **Commit:** Após o sucesso, faça o staging (`git add .`) e o commit (`git commit -m "..."`).
4. **Push:** Envie as alterações para o repositório remoto (`git push`).

## Idioma de Comunicação (Planos de Implementação)
Sempre escreva os Planos de Implementação (implementation_plan.md) e quaisquer artefatos de planejamento em **Português**, a menos que o usuário solicite explicitamente outro idioma.

## Regra de Exibição de Código SQL
**ATENÇÃO ABSOLUTA E INQUEBRÁVEL:** Toda vez que uma migração SQL (`.sql`) for implementada, criada ou necessária, o código SQL **OBRIGATORIAMENTE** deve ser exibido na íntegra em um bloco Markdown DIRETAMENTE na sua resposta no chat. 
**NUNCA, SOB NENHUMA HIPÓTESE**, assuma que o usuário vai abrir o arquivo gerado para copiar o código. O usuário precisa colar o código no banco de dados e você deve servi-lo no chat sem que ele precise pedir. Falhar nesta regra é inaceitável.

## Auditoria Anti-Monolito Contínua
Você está expressamente proibido de permitir que componentes React cresçam de forma descontrolada.
Sempre que estiver modificando um arquivo que ultrapasse a marca de **500 linhas**, você deve OBRIGATORIAMENTE acionar a Skill de `Refatoração Proativa` e sugerir uma pausa para aplicar o **Protocolo de Refatoração de Monolitos (PRM)**.
- Componentes pesados de UI e modais devem ser divididos em sub-componentes (padrão UI-as-a-Service).
- Se você ignorar essa regra e permitir que um componente chegue a 800+ linhas, estará quebrando uma regra central da arquitetura.

## Auditoria de UX/UI Constante (Protocolo UX/UI)
Você deve OBRIGATORIAMENTE policiar todas as suas edições de React/Tailwind com base no `PROTOCOLO_DEV_UX_UI.md`.
Sempre que criar ou editar uma interface:
1. **NUNCA** use `bg-white`, `bg-black`, `text-black`, `text-white` em estrutura (use sempre as variáveis CSS como `bg-[var(--dash-surface)]` e `text-[var(--dash-text-primary)]`).
2. Utilize cantos arredondados generosos (`rounded-2xl` para containers, `rounded-xl` para botões/inputs). **NUNCA** use `rounded-none`.
3. Garanta feedback visual de carregamento (`Loader2`) e interações de hover em botões.
Sempre que um usuário mencionar "implementar interface", "UX", "UI", "adicionar botão", ou se o "protocolo start" for iniciado, você deve acionar a Skill `Auditoria UX/UI` para rodar o script de varredura no dashboard.
