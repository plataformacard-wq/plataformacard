# Regras de Customização da PlataformaCard

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
